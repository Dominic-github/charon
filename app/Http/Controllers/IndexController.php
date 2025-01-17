<?php

namespace App\Http\Controllers;

use App\Services\AuthenticationService;
use App\Services\ProxyAuthService;
use Illuminate\Http\Request;

class IndexController extends Controller
{
    public function __invoke(Request $request, ProxyAuthService $proxyAuthService, AuthenticationService $auth)
    {
        $data = ['token' => null];

        if (config('charon.proxy_auth.enabled')) {
            $data['token'] = optional(
                $proxyAuthService->tryGetProxyAuthenticatedUserFromRequest($request),
                static fn ($user) => $auth->logUserIn($user)->toArray()
            );
        }

        return view('index', $data);
    }
}
