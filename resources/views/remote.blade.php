@extends('base')

@section('title', 'Charon - Remote Controller')

@push('scripts')
<script>
    window.SSO_PROVIDERS = @json(collect_sso_providers());
</script>
@vite(['resources/assets/js/remote/app.ts'])
@endpush