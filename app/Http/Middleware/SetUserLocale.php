<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetUserLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->hasHeader('X-Locale')) {
            app()->setLocale($request->header('X-Locale'));
        } elseif ($request->user() && $request->user()->locale) {
            app()->setLocale($request->user()->locale);
        } else {
             app()->setLocale(config('app.locale'));
        }

        return $next($request);
    }
}
