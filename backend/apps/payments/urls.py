from django.urls import path
from . import views

app_name = 'payments'

urlpatterns = [
    # Payment methods
    path('methods/', views.PaymentMethodListView.as_view(), name='method-list'),
    path('methods/add/', views.AddPaymentMethodView.as_view(), name='method-add'),
    path('methods/<uuid:pk>/delete/', views.DeletePaymentMethodView.as_view(), name='method-delete'),
    path('methods/<uuid:pk>/set-default/', views.SetDefaultPaymentMethodView.as_view(), name='method-default'),

    # Payments
    path('', views.PaymentListView.as_view(), name='payment-list'),
    path('create/', views.CreatePaymentView.as_view(), name='payment-create'),
    path('<uuid:pk>/', views.PaymentDetailView.as_view(), name='payment-detail'),

    # Refunds
    path('refund/', views.RequestRefundView.as_view(), name='refund-request'),

    # Subscriptions
    path('subscription/', views.SubscriptionView.as_view(), name='subscription'),
    path('subscription/subscribe/', views.SubscribeView.as_view(), name='subscribe'),
    path('subscription/cancel/', views.CancelSubscriptionView.as_view(), name='cancel-subscription'),

    # Invoices
    path('invoices/', views.InvoiceListView.as_view(), name='invoice-list'),
    path('invoices/create/', views.InvoiceCreateView.as_view(), name='invoice-create'),
    path('invoices/<uuid:pk>/', views.InvoiceDetailView.as_view(), name='invoice-detail'),

    # Payouts (for attorneys)
    path('payouts/', views.PayoutListView.as_view(), name='payout-list'),
    path('earnings-summary/', views.EarningsSummaryView.as_view(), name='earnings-summary'),
]
