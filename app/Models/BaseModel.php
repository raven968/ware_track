<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use App\Traits\LogsSystemActivity;

abstract class BaseModel extends Model
{
    use SoftDeletes, LogsSystemActivity;

    protected $guarded = ['id'];
}
