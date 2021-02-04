@if(!isset($template_item) && (isset($custom_form_column['has_custom_forms']) && boolval($custom_form_column['has_custom_forms'])))

@else
<div class="ui-state-default custom_form_column_item draggable form_column_type_{{$custom_form_column['form_column_type']}}"
    style="{{boolval(array_get($custom_form_column, 'delete_flg')) ? 'display:none' : ''}}"
    id="{{preg_replace('/\[|\]/', '_', $custom_form_column['header_column_name'])}}" data-header_column_name="{{preg_replace('/\[|\]/', '_', $custom_form_column['header_column_name'])}}">
        <span class="item-label {{array_get($custom_form_column, 'required') ? 'asterisk' : ''}}">{{ $custom_form_column['column_view_name'] }}</span>

        <a href="javascript:void(0);" class="config-icon pull-right delete" style="display:{{!boolval($suggest) ? 'inline-block' : 'none'}};" data-toggle="tooltip" title="{{exmtrans('common.deleted')}}">
            <i class="fa fa-trash"></i>
        </a>
        
        <a href="javascript:void(0);" class="config-icon pull-right setting" style="display:{{!boolval($suggest) ? 'inline-block' : 'none'}};" data-widgetmodal_method="POST" data-toggle="tooltip" title="{{trans('admin.setting')}}">
            <i class="fa fa-cog"></i>
        </a>
        
        @include('exment::custom-form.fields.block-hidden', ['param_name' => 'form_block_type'])
        @include('exment::custom-form.fields.block-hidden', ['param_name' => 'form_block_target_table_id'])
        @include('exment::custom-form.fields.column-hidden', ['param_name' => 'options'])

        {{-- Show only items. not show suggests --}}
        @if(!boolval($suggest))
        @include('exment::custom-form.fields.column-hidden', ['param_name' => 'form_column_target_id'])
        @include('exment::custom-form.fields.column-hidden', ['param_name' => 'form_column_type'])
        @include('exment::custom-form.fields.column-hidden', ['param_name' => 'row_no'])
        @include('exment::custom-form.fields.column-hidden', ['param_name' => 'column_no'])
        @include('exment::custom-form.fields.column-hidden', ['param_name' => 'width'])
        {{ Form::hidden("{$custom_form_block['header_name']}{$custom_form_column['header_column_name']}[required]", array_get($custom_form_column, 'required'), ['class' => 'required_item']) }}
        @endif

        @if(boolval(array_get($custom_form_column, 'delete_flg')))
        @include('exment::custom-form.fields.column-hidden', ['param_name' => 'delete_flg'])
        @endif

        {{-- set value for script, and set disabled(don't post. only use script) --}}
        @include('exment::custom-form.fields.column-hidden-disabled', ['param_name' => 'form_column_type'])
        @include('exment::custom-form.fields.column-hidden-disabled', ['param_name' => 'form_column_target_id'])
        @include('exment::custom-form.fields.column-hidden-disabled', ['param_name' => 'header_column_name'])
        @include('exment::custom-form.fields.column-hidden-disabled', ['param_name' => 'required'])
        @include('exment::custom-form.fields.column-hidden-disabled', ['param_name' => 'validation_rules'])
    </div>    
@endif
