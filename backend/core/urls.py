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

<<<<<<< HEAD

=======
urlpatterns = router.urls
>>>>>>> d763c6ecd265dabce2f36472b1a12ac3d7f3673c


from django.urls import path, include


   

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', UserCreateView.as_view(), name='user-create'),
    path('stats/summary/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('accounts/', include('rest_framework.urls')),
]

