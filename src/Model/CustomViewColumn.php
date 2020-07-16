<?php

namespace Exceedone\Exment\Model;

use Exceedone\Exment\Enums\ConditionType;
use Exceedone\Exment\Enums\SystemColumn;

class CustomViewColumn extends ModelBase
{
    use Traits\UseRequestSessionTrait;
    use Traits\ClearCacheTrait;
    use Traits\AutoSUuidTrait;
    use Traits\CustomViewColumnTrait;
    use Traits\CustomViewColumnOptionTrait;
    use Traits\TemplateTrait;
    use Traits\DatabaseJsonOptionTrait;

    protected $guarded = ['id'];
    protected $appends = ['view_column_target', 'view_column_end_date', 'view_group_condition', 'view_column_color', 'view_column_font_color', 'sort_order', 'sort_type'];
    //protected $with = ['custom_column'];
    protected $casts = ['options' => 'json'];

    public static $templateItems = [
        'excepts' => [
            'import' => ['custom_table', 'view_column_target', 'custom_column', 'target_view_name', 'view_column_name', 'view_group_condition', 'view_pivot_column_name', 'view_pivot_table_name'],
            'export' => ['custom_table', 'custom_view_id', 'view_column_target', 'custom_column', 'target_view_name', 'view_column_name', 'view_column_table_id', 'view_column_target_id', 'view_pivot_column_id', 'view_pivot_table_id', 'view_group_condition'],
        ],
        'uniqueKeys' => ['custom_view_id', 'view_column_type', 'view_column_target_id', 'view_column_table_id'],
        'parent' => 'custom_view_id',
        'uniqueKeyReplaces' => [
            [
                'replaceNames' => [
                    [
                        'replacedName' => [
                            'table_name' => 'view_column_table_name',
                            'column_name' => 'view_column_target_name',
                        ]
                    ]
                ],
                'uniqueKeyFunction' => 'getUniqueKeyValues',
            ],
            [
                'replaceNames' => [
                    [
                        'replacedName' => [
                            'table_name' => 'view_pivot_table_name',
                            'column_name' => 'view_pivot_column_name',
                        ]
                    ]
                ],
                'uniqueKeyFunction' => 'getPivotUniqueKeyValues',
            ],
        ],
        'enums' => [
            'view_column_type' => ConditionType::class,
        ],
    ];

    /**
     * get eloquent using request settion.
     * now only support only id.
     */
    public static function getEloquent($id, $withs = [])
    {
        return static::getEloquentDefault($id, $withs);
    }

    protected static function boot()
    {
        parent::boot();
        
        static::saving(function ($model) {
            $model->prepareJson('options');
        });

        // add default order
        static::addGlobalScope(new OrderScope('order'));
    }

    public function getViewColumnColorAttribute()
    {
        return $this->getOption('color');
    }
    public function setViewColumnColorAttribute($view_column_color)
    {
        $this->setOption('color', $view_column_color);

        return $this;
    }
    
    public function getViewColumnFontColorAttribute()
    {
        return $this->getOption('font_color');
    }
    public function setViewColumnFontColorAttribute($view_column_color)
    {
        $this->setOption('font_color', $view_column_color);

        return $this;
    }
    
    public function getViewColumnEndDateAttribute()
    {
        return $this->getViewColumnTarget('view_column_table_id', 'options.end_date_type', 'options.end_date_target');
    }
    public function setViewColumnEndDateAttribute($end_date)
    {
        if (!isset($end_date)) {
            $this->setOption('end_date_type', null);
            $this->setOption('end_date_target', null);
            return $this;
        }
        
        list($column_type, $column_table_id, $column_type_target, $view_pivot_column, $view_pivot_table) = $this->getViewColumnTargetItems($end_date);

        $this->setOption('end_date_type', $column_type);
        $this->setOption('end_date_target', $column_type_target);

        return $this;
    }

    public function getViewPivotColumnIdAttribute()
    {
        return $this->getOption('view_pivot_column_id');
    }
    public function setViewPivotColumnIdAttribute($view_pivot_column_id)
    {
        if (!isset($view_pivot_column_id)) {
            $this->setOption('view_pivot_column_id', null);
            return $this;
        }
        $this->setOption('view_pivot_column_id', $view_pivot_column_id);
        return $this;
    }
    public function getViewPivotTableIdAttribute()
    {
        return $this->getOption('view_pivot_table_id');
    }
    public function setViewPivotTableIdAttribute($view_pivot_table_id)
    {
        if (!isset($view_pivot_table_id)) {
            $this->setOption('view_pivot_table_id', null);
            return $this;
        }
        $this->setOption('view_pivot_table_id', $view_pivot_table_id);
        return $this;
    }

    
    public function getViewGroupConditionAttribute()
    {
        return $this->getOption('view_group_condition');
    }
    public function setViewGroupConditionAttribute($view_group_condition)
    {
        return $this->setOption('view_group_condition', $view_group_condition);
    }

    public function getViewColumnEndDateTypeAttribute()
    {
        return $this->getOption('end_date_type');
    }
    
    /**
     * get Table And Column Name
     */
    public function getPivotUniqueKeyValues()
    {
        if (!isset($this->view_pivot_column_id)) {
            return [
                'table_name' => null,
                'column_name' => null,
            ];
        }

        $table_name = CustomTable::getEloquent($this->view_pivot_table_id)->table_name;
        switch ($this->view_column_type) {
            case ConditionType::COLUMN:
                return [
                    'table_name' => $table_name,
                    'column_name' => CustomColumn::getEloquent($this->view_pivot_column_id)->column_name ?? null,
                ];
            case ConditionType::SYSTEM:
                return [
                    'table_name' => $table_name,
                    'column_name' => SystemColumn::getOption(['id' => $this->view_pivot_column_id])['name'] ?? null,
                ];
        }
        return [];
    }
}
