<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;

trait LogsSystemActivity
{
    public static function bootLogsSystemActivity()
    {
        static::created(function (Model $model) {
            self::logActivity('created', $model);
        });

        static::updated(function (Model $model) {
            self::logActivity('updated', $model);
        });

        static::deleted(function (Model $model) {
            self::logActivity('deleted', $model);
        });
    }

    protected static function logActivity(string $action, Model $model)
    {
        // Avoid infinite recursion if logging the log itself (unlikely but safe)
        if ($model->getTable() === 'system_logs') {
            return;
        }

        $original = null;
        $changed = null;

        if ($action === 'created') {
            $changed = $model->getAttributes();
        } elseif ($action === 'updated') {
            $original = $model->getOriginal();
            $changed = $model->getChanges();
        } elseif ($action === 'deleted') {
            $original = $model->getAttributes();
        }

        try {
            DB::table('system_logs')->insert([
                'user_id' => Auth::id(),
                'action' => $action,
                'model_type' => get_class($model),
                'model_id' => $model->getKey(),
                'original_data' => $original ? json_encode($original) : null,
                'changed_data' => $changed ? json_encode($changed) : null,
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        } catch (\Exception $e) {
            // Fail silently or log to file to avoid breaking the app if logging fails
            // Log::error('Failed to write system log: ' . $e->getMessage());
        }
    }
}
