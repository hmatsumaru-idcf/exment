<?php
namespace Exceedone\Exment\Services\ViewFilter;

use Exceedone\Exment\Enums\FilterOption;

abstract class NumberCompareBase extends ViewFilterBase
{
    protected function _setFilter($query, $method_name, $query_column, $query_value)
    {
        $query_value = $this->column_item->convertFilterValue($query_value);
        $query->{$method_name}($query_column, $this->getMark(), $query_value);
    }
    
    abstract protected function getMark() : string;
}
