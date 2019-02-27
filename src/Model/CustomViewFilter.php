<?php

namespace Exceedone\Exment\Model;

use Exceedone\Exment\Enums\ViewColumnType;

class CustomViewFilter extends ModelBase
{
    protected $guarded = ['id'];
    protected $appends = ['view_column_target'];
    use \Illuminate\Database\Eloquent\SoftDeletes;
    use Traits\CustomViewColumnTrait;

    public function custom_view()
    {
        return $this->belongsTo(CustomView::class, 'custom_view_id');
    }
    
    public function custom_column()
    {
        if($this->view_column_type == ViewColumnType::SYSTEM){
            return null;
        }
        return $this->belongsTo(CustomColumn::class, 'view_column_target_id');
            ;
    }
}
