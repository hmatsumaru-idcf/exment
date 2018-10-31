<?php

namespace Exceedone\Exment\Controllers;

use Exceedone\Exment\Model\Define;
use Exceedone\Exment\Model\CustomTable;
use Exceedone\Exment\Model\Plugin;
use Exceedone\Exment\Model\Menu;
use Encore\Admin\Controllers\ModelForm;
use Encore\Admin\Auth\Database\Role;
use Encore\Admin\Facades\Admin;
use Encore\Admin\Form;
use Encore\Admin\Layout\Column;
use Encore\Admin\Layout\Content;
use Encore\Admin\Layout\Row;
use Encore\Admin\Tree;
use Encore\Admin\Widgets\Box;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MenuController extends AdminControllerBase
{
    use ModelForm, ExmentControllerTrait;

    public function __construct(Request $request){
        $this->setPageInfo(trans('admin.menu'), trans('admin.menu'), trans('admin.list'));  
    }

    /**
     * Index interface.
     *
     * @return Content
     */
    public function index(Request $request, Content $content)
    {
        $this->AdminContent($content);
        return 
            $content->row(function (Row $row) {
            $row->column(5, $this->treeView()->render());

            $row->column(7, function (Column $column) {
                    $form = new \Encore\Admin\Widgets\Form();
                    $form->action(admin_base_path('auth/menu'));

                    $this->createMenuForm($form);
                    //$form->select('parent_id', trans('admin.parent_id'))->options(Menu::selectOptions());
                    //$form->text('menu_name', trans('admin.title'))->rules('required');
                    //$form->icon('icon', trans('admin.icon'))->default('fa-bars')->rules('required')->help($this->iconHelp());
                    //$form->text('uri', trans('admin.uri'));
                    //$form->multipleSelect('roles', trans('admin.roles'))->options(Role::all()->pluck('name', 'id'));
                    $form->hidden('_token')->default(csrf_token());

                    $column->append((new Box(trans('admin.new'), $form))->style('success'));
            });
        });
    }

    /**
     * Redirect to edit page.
     *
     * @param int $id
     *
     * @return \Illuminate\Http\RedirectResponse
     */
    public function show(Request $request, $id, Content $content)
    {
        return redirect()->route('menu.edit', ['id' => $id]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param int $id
     *
     * @return \Illuminate\Http\Response
     */
    public function update($id)
    {
        return $this->form($id)->update($id);
    }

    /**
     * @return \Encore\Admin\Tree
     */
    protected function treeView()
    {
        return Menu::tree(function (Tree $tree) {
            $tree->disableCreate();

            $tree->branch(function ($branch) {

                switch($branch['menu_type']){
                    case Define::MENU_TYPE_PLUGIN;
                        $icon = null;
                        $uri = null;
                        break;
                    case Define::MENU_TYPE_TABLE;
                        $icon = $branch['icon'];
                        $uri = $branch['table_name'];
                        break;
                    case Define::MENU_TYPE_SYSTEM;
                        $icon = $branch['icon'];
                        $uri = array_get(Define::MENU_SYSTEM_DEFINITION, "{$branch['menu_name']}.uri");
                        break;
                    default:
                        $icon = null;
                        $uri = null;
                        break;
                }
                $payload = "<i class='fa {$icon}'></i>&nbsp;<strong>{$branch['title']}</strong>";

                if (!isset($branch['children'])) {
                    if (!url()->isValidUrl($uri)) {
                        $uri = admin_base_path($uri);
                    }

                    $payload .= "&nbsp;&nbsp;&nbsp;<a href=\"$uri\" class=\"dd-nodrag\">$uri</a>";
                }

                return $payload;
            });
        });
    }

    /**
     * Make a form builder.
     *
     * @return Form
     */
    public function form($id = null)
    {
        return Menu::form(function (Form $form) use($id) {
            $this->createMenuForm($form, $id);
        });
    }

    protected function createMenuForm($form, $id = null){
        // get setting menu object
        $menu = Menu::find($id);

        // set controller
        $contoller = $this;
        $form->select('parent_id', trans('admin.parent_id'))->options(Menu::selectOptions());
        $form->select('menu_type', exmtrans("menu.menu_type"))->options(getTransArray(Define::MENU_TYPES, "menu.menu_type_options"))
            ->load('menu_target', admin_base_path('api/menu/menutype'))
            ->required();

        $form->select('menu_target', exmtrans("menu.menu_target"))
            ->attribute(['data-changedata' => json_encode(
                ['getitem' => 
                    [  'uri' => admin_base_path('api/menu/menutargetvalue') 
                       , 'key' => ['menu_type']
                    ]
                ]
            ), 'data-filter' => json_encode([
                'key' => 'menu_type', 'readonlyValue' => [Define::MENU_TYPE_CUSTOM, Define::MENU_TYPE_PARENT_NODE]
            ])])
            ->options(function($option) use($menu, $contoller){
                // get model 
                if(!isset($menu)){
                    return [];
                }
                return $contoller->getMenuType(array_get($menu, 'menu_type'), false);
            })
        ;
        $form->text('uri', trans('admin.uri'))
            ->attribute(['data-filter' => json_encode([
                'key' => 'menu_type', 'readonlyValue' => [Define::MENU_TYPE_SYSTEM, Define::MENU_TYPE_PLUGIN, Define::MENU_TYPE_TABLE, Define::MENU_TYPE_PARENT_NODE]
            ])]);
        $form->text('menu_name', exmtrans("menu.menu_name"))
            ->required()
            ->rules(
                [
                    Rule::unique(config('admin.database.menu_table'))->ignore($id),
                ]
            )->help(exmtrans('common.help_code'));
        $form->text('title', exmtrans("menu.title"))->required();
        $form->icon('icon', trans('admin.icon'))->default('');
        $form->hidden('order');

        $form->saving(function ($form) {
            // whether set order
            $isset_order = false;
            // get parent id
            $parent_id = $form->parent_id;
            
            // get id
            $id = $form->model()->id;
            // if not set id(create), set order
            if(!isset($id)){
                $isset_order = true;
            }
            // if set id(update), whether change parent id
            else{
                $model_parent_id = $form->model()->parent_id;
                $isset_order = ($model_parent_id != $parent_id);
            }
            
            // get same parent_id count
            if($isset_order){
                $query = Menu::where('parent_id', $parent_id);
                if(isset($id)){
                    $query->whereNot('id', $id);
                }
                $count = $query->count();
                // set order $count+1;
                $form->order = $count + 1;
            }
        });
    }

    // menu_type and menutargetvalue --------------------------------------------------

    // get menu type(calling from menu_type)
    public function menutype(Request $request){
        $type = $request->input('q');
        return $this->getMenuType($type, true);
    }

    /**
     * get menu type option array
     * @param string menu_type string
     * @param boolean isApi is api. if true, return id and value array. if false, return array(key:id, value:name)
     */
    protected function getMenuType($type, $isApi){
        $options = [];
        switch($type){
            case Define::MENU_TYPE_SYSTEM:
                foreach (Define::MENU_SYSTEM_DEFINITION as $k => $value)
                {
                    array_push($options, ['id' => $k, 'text' => exmtrans("menu.system_definitions.".$k ) ]);
                }
                break;
            case Define::MENU_TYPE_PLUGIN:
                $options = [];
                foreach (Plugin::where('plugin_type', 'page')->get() as $value)
                {
                    array_push($options, ['id' => $value->id, 'text' => $value->plugin_view_name]);
                }
                break;
            case Define::MENU_TYPE_TABLE:
                foreach (CustomTable::where('showlist_flg', true)->get() as $value)
                {
                    array_push($options, ['id' => $value->id, 'text' => $value->table_view_name]);
                }
                break;
        }

        // if api, return
        if($isApi){
            return $options;
        }
        // if not api, return key:id, value:text array
        return collect($options)->pluck('text', 'id')->toArray();
    }

    public function menutargetvalue(Request $request){
        $type = $request->input('menu_type');
        $value = $request->input('value');
        switch($type){
            case Define::MENU_TYPE_SYSTEM:          
                $item = array_get(Define::MENU_SYSTEM_DEFINITION, $value);
                return [
                    'menu_name' => $value,
                    'title' => exmtrans("menu.system_definitions.".$value ),
                    'icon' => array_get($item, 'icon'),
                    'uri' => array_get($item, 'uri'),
                ];  
            case Define::MENU_TYPE_PLUGIN:
                $item = Plugin::find($value);
                return [
                    'menu_name' => array_get($item, 'plugin_name'),
                    'title' => array_get($item, 'plugin_view_name'),
                    'icon' => array_get($item, 'icon'),
                    'uri' => array_get($item, 'options.uri'),
                ];  
                return Plugin::find($value);
            case Define::MENU_TYPE_TABLE:
                $item = CustomTable::find($value);
                return [
                    'menu_name' => array_get($item, 'table_name'),
                    'title' => array_get($item, 'table_view_name'),
                    'icon' => array_get($item, 'icon'),
                    'uri' => array_get($item, 'table_name'),
                ];  
            case Define::MENU_TYPE_CUSTOM:
                return [
                    'menu_name' => '',
                    'title' => '',
                    'icon' => '',
                    'uri' => '',
                ];  
                
            case Define::MENU_TYPE_PARENT_NODE:
                return [
                    'menu_name' => '',
                    'title' => '',
                    'icon' => '',
                    'uri' => '#',
                ];  
        }

        return [];
    }

}
