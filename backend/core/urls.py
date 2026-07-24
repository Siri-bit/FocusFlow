from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, TransactionViewSet, DashboardStatsView, UserCreateView, PomodoroViewSet

router = DefaultRouter()

router.register(r'tasks', TaskViewSet, basename='task')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'pomodoros', PomodoroViewSet, basename='pomodoro')


# from rest_framework.routers import DefaultRouter
# from .views import TaskViewSet

# router = DefaultRouter()
# router.register(r'tasks', TaskViewSet, basename='task')

urlpatterns = router.urls


from django.urls import path, include


   

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', UserCreateView.as_view(), name='user-create'),
    path('stats/summary/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('accounts/', include('rest_framework.urls')),
]

