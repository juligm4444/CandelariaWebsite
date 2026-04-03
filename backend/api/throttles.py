from rest_framework.throttling import ScopedRateThrottle


class BurstRateThrottle(ScopedRateThrottle):
    scope = 'burst'


class AuthRateThrottle(ScopedRateThrottle):
    scope = 'auth'
