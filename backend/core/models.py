from django.db import models
from django.contrib.auth.models import AbstractUser
#from django.contrib.auth.models import User

from django.conf import settings
from django.conf import settings
from django.db import models

class Budget(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    total_budget = models.DecimalField(max_digits=10, decimal_places=2)


   

class User(AbstractUser):
    monthly_budget = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    budget_last_updated = models.DateTimeField(null=True, blank=True)




import uuid

class Pomodoro(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    task = models.OneToOneField('Task', on_delete=models.CASCADE, related_name='pomodoro')
    is_running = models.BooleanField(default=False)
    start_time = models.DateTimeField(null=True, blank=True)
    total_focus_time = models.IntegerField(default=0)
    sessions_done = models.IntegerField(default=0)

    def __str__(self):
        return f"Pomodoro for {self.task.title}"

class Task(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    
    is_completed = models.BooleanField(default=False)
    
    PRIORITY_CHOICES = [
        ('LOW', 'Low'),
        ('MEDIUM', 'Medium'),
        ('HIGH', 'High'),
    ]
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='MEDIUM')

    # ✅ Expense related
    price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    has_expense = models.BooleanField(default=False)

    # Recurrence
    is_recurring = models.BooleanField(default=False)
    recurrence_rule = models.JSONField(null=True, blank=True) # e.g. {"type": "daily", "interval": 1}
    last_completed_date = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        is_new = self.pk is None
        if self.price and float(self.price) > 0:
            self.has_expense = True
        else:
            self.has_expense = False
        super().save(*args, **kwargs)
        if is_new:
             if not hasattr(self, 'pomodoro'):
                 Pomodoro.objects.create(task=self)

    def __str__(self):
        return self.title

class Transaction(models.Model):
    TRANSACTION_TYPES = [
        ('CREDIT', 'Credit'), # Income
        ('DEBIT', 'Debit'),   # Expense
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    title = models.CharField(max_length=255)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_type = models.CharField(max_length=10, choices=TRANSACTION_TYPES, default='DEBIT')
    date = models.DateTimeField(auto_now_add=True)
    
    linked_task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.title} - ${self.amount} ({self.transaction_type})"
