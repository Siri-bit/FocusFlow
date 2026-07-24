from rest_framework import serializers
from .models import User, Task, Transaction

# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['id', 'username', 'email', 'password', 'monthly_budget']
#         extra_kwargs = {'password': {'write_only': True}}
        
#         budget_val = validated_data.get('monthly_budget', 0.00)
#         from django.utils import timezone
        
#         user = User.objects.create_user(
#             username=validated_data['username'],
#             email=validated_data.get('email', ''),
#             password=validated_data['password'],
#             monthly_budget=budget_val,
#         )
#             if float(budget_val) > 0:
#               user.budget_last_updated = timezone.now()
#             user.save()
#         return user
    
    
    
from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password', 'monthly_budget']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        budget_val = validated_data.get('monthly_budget', 0.00)

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )

        # set budget separately (if your model has this field)
        user.monthly_budget = budget_val

        if float(budget_val) > 0:
            user.budget_last_updated = timezone.now()

        user.save()
        return user



# class TaskSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Task
#         fields = '__all__'
#         read_only_fields = ['user', 'created_at']
        
        
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = [
            'user',
            'created_at',
            'has_expense',
        ]


        
        
        
# class TransactionSerializer(serializers.ModelSerializer):
#     category = serializers.PrimaryKeyRelatedField(
#         queryset=Category.objects.all(),
#         required=False,
#         allow_null=True
#     )
    
#     linked_task = serializers.PrimaryKeyRelatedField(
#         queryset=Task.objects.all(),
#         required=False,
#         allow_null=True
#     )

#     class Meta:
#         model = Transaction
#         fields = '__all__'
#         read_only_fields = ['user', 'date']
        
        
        
from rest_framework import serializers
from django.db.models import Sum
from .models import Transaction, Budget

class TransactionSerializer(serializers.ModelSerializer):
    monthly_budget = serializers.DecimalField(max_digits=10, decimal_places=2, write_only=True, required=False)

    class Meta:
     model = Transaction
     fields = '__all__'
     read_only_fields = [
        'user',
        'date',
     ]

    def validate(self, data):
        user = self.context['request'].user
        from django.utils import timezone

        # Handle updating budget from transaction payload
        monthly_budget = data.pop('monthly_budget', None)
        if monthly_budget is not None and float(monthly_budget) > 0:
            user.monthly_budget = monthly_budget
            user.budget_last_updated = timezone.now()
            user.save()

        # Check if budget was set this month
        now = timezone.now()
        is_budget_set_this_month = (
            user.budget_last_updated is not None and 
            user.budget_last_updated.year == now.year and 
            user.budget_last_updated.month == now.month
        )

        if not is_budget_set_this_month or float(user.monthly_budget) <= 0:
            raise serializers.ValidationError("Please set a budget for this month first")

        # Visual warning is handled by the frontend, so no strict blocking here even if balance < 0
        return data

class PomodoroSerializer(serializers.ModelSerializer):
    class Meta:
        from .models import Pomodoro
        model = Pomodoro
        fields = '__all__'
