#from backend.permissions import IsOwner
from .permissions import IsOwner
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Sum, Count
from .models import Task, Transaction, Pomodoro
from .serializers import TaskSerializer, TransactionSerializer, UserSerializer, PomodoroSerializer
from rest_framework import generics, permissions

from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer

from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone




class UserCreateView(generics.CreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]






class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    #permission_classes = [permissions.IsAuthenticated]
    
    
    
    
    permission_classes = [permissions.IsAuthenticated, IsOwner]

    def get_queryset(self):
     return Task.objects.filter(user=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
        
        


    @action(detail=True, methods=['post'])
    def start_pomodoro(self, request, pk=None):
        task_id = self.get_object()
        pomodoro, created = Pomodoro.objects.get_or_create(task=task_id)

        # ❌ Block expense tasks
        if task_id.has_expense:
            return Response({
                "error": "Pomodoro not allowed for expense tasks"
            }, status=400)

        # ❌ Already running
        if pomodoro.is_running:
            return Response({
                "error": "Pomodoro already running"
            }, status=400)

        # ✅ Start
        pomodoro.is_running = True
        pomodoro.start_time = timezone.now()
        pomodoro.save()

        return Response({
            "message": "Pomodoro started",
            "task_id": task_id.id,
            "start_time": pomodoro.start_time
        })

    @action(detail=True, methods=['post'])
    def stop_pomodoro(self, request, pk=None):
        task_id = self.get_object()
        pomodoro, created = Pomodoro.objects.get_or_create(task=task_id)

        if not pomodoro.is_running:
            return Response({"error": "Pomodoro not running"}, status=400)

        end_time = timezone.now()
        duration = (end_time - pomodoro.start_time).total_seconds()

        pomodoro.total_focus_time += int(duration)

        # 25 mins = 1500 sec
        sessions = int(duration // 1500)
        pomodoro.sessions_done += sessions

        pomodoro.is_running = False
        pomodoro.start_time = None
        pomodoro.save()

        return Response({
            "focused_time_seconds": int(duration),
            "sessions_added": sessions,
            "total_sessions": pomodoro.sessions_done
        })

    # @action(detail=True, methods=['post'])
    # def increment_pomodoro(self, request, pk=None):
    #     task = self.get_object()
    #     pomodoro, created = Pomodoro.objects.get_or_create(task=task)
    #     pomodoro.sessions_done += 1
    #     pomodoro.save()
    #     return Response({'status': 'sessions incremented', 'sessions_done': pomodoro.sessions_done})
        
    @action(detail=True, methods=['patch'])
    def toggle_complete(self, request, pk=None):
        task = self.get_object()
        task.is_completed = not task.is_completed
        if task.is_completed:
            task.last_completed_date = timezone.now()
        task.save()
        # Note: Expense creation is handled by the post_save signal auto-magically
        serializer = self.get_serializer(task)
        return Response(serializer.data)

class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class PomodoroViewSet(viewsets.ModelViewSet):
    serializer_class = PomodoroSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Pomodoro.objects.filter(task__user=self.request.user)

from rest_framework.views import APIView
class DashboardStatsView(APIView):
    #permission_classes = [permissions.IsAuthenticated]
    
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        tasks_completed = Task.objects.filter(user=user, is_completed=True).count()
        
        total_sessions = Pomodoro.objects.filter(task__user=user).aggregate(Sum('sessions_done'))['sessions_done__sum'] or 0
        focus_hours = round((total_sessions * 25) / 60, 2)
        
        # Monthly spending and income
        current_month = timezone.now().month
        monthly_spending = Transaction.objects.filter(
            user=user, 
            date__month=current_month,
            transaction_type='DEBIT'
        ).aggregate(Sum('amount'))['amount__sum'] or 0
        
        monthly_income = Transaction.objects.filter(
            user=user, 
            date__month=current_month,
            transaction_type='CREDIT'
        ).aggregate(Sum('amount'))['amount__sum'] or 0

        total_spending = Transaction.objects.filter(user=user, transaction_type='DEBIT').aggregate(Sum('amount'))['amount__sum'] or 0
        total_income = Transaction.objects.filter(user=user, transaction_type='CREDIT').aggregate(Sum('amount'))['amount__sum'] or 0
        total_available_balance = float(total_income) - float(total_spending)

        # Budget Check
        now = timezone.now()
        is_budget_set_this_month = (
            user.budget_last_updated is not None and 
            user.budget_last_updated.year == now.year and 
            user.budget_last_updated.month == now.month
        )
        effective_budget = user.monthly_budget if is_budget_set_this_month else 0.00

        alert_message = None
        if effective_budget and monthly_spending > effective_budget:
            alert_message = "ALERT: You have exceeded your monthly budget!"
        elif effective_budget and monthly_spending == effective_budget:
            alert_message = "WARNING: You have exactly reached your monthly budget limit."
        
        # Recent Activity
        recent_tasks = Task.objects.filter(user=user).order_by('-created_at')[:3]
        recent_transactions = Transaction.objects.filter(user=user).order_by('-date')[:3]

        recent_activity = []
        for t in recent_tasks:
            status = 'Completed' if t.is_completed else 'Added'
            expense_str = f" (${t.price})" if t.price and t.price > 0 else ""
            recent_activity.append({
                'type': 'task',
                'title': f"{status} task: {t.title}{expense_str}",
                'date': getattr(t, 'last_completed_date', t.created_at) or t.created_at,
            })
        for dict_item in recent_transactions:
            recent_activity.append({
                'type': 'transaction',
                'title': f"{'Earned' if dict_item.transaction_type == 'CREDIT' else 'Spent'} ${dict_item.amount} for {dict_item.title}",
                'date': dict_item.date,
            })
            
        recent_activity.sort(key=lambda x: x['date'] if x['date'] else timezone.now(), reverse=True)

        return Response({
            'total_tasks_completed': tasks_completed,
            'total_focus_hours': focus_hours,
            'total_monthly_spending': monthly_spending,
            'total_monthly_income': monthly_income,
            'total_available_balance': total_available_balance,
            'monthly_budget': effective_budget,
            'alert_message': alert_message,
            'recent_activity': recent_activity[:5]
        })
