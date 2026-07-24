from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Task, Transaction

@receiver(post_save, sender=Task)
def create_expense_on_task_creation(sender, instance, created, **kwargs):
    # Act if the task has a price
    if instance.price and instance.price > 0:
        # Check if an expense for this task already exists to prevent duplicates
        expense_exists = Transaction.objects.filter(linked_task=instance).exists()
        
        if not expense_exists:
            Transaction.objects.create(
                user=instance.user,
                title=f"Expense from Task: {instance.title}",
                amount=instance.price,
                date=timezone.now(),
                linked_task=instance
                
            )
