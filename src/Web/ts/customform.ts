
namespace Exment {
    export class CustomFromEvent {
        public static AddEvent() {
            
            CustomFromEvent.loadingEvent();
            CustomFromEvent.appendSwitchEvent($('.la_checkbox:visible'));
            CustomFromEvent.appendIcheckEvent($('.box-custom_form_block .icheck:visible, .box-custom_form_block .icheck.icheck_hasmany_type'));
            $('form').on('submit', CustomFromEvent.formSubmitEvent);
        }

        public static AddEventOnce() {
            $(document).on('ifChanged check', '.box-custom_form_block .icheck_toggleblock', {}, CustomFromEvent.toggleFromBlock);
            $(document).on('click.exment_custom_form', '.box-custom_form_block .delete', {}, CustomFromEvent.deleteColumn);
            $(document).on('click.exment_custom_form', '.box-custom_form_block .setting', {}, CustomFromEvent.settingModalEvent);
            $(document).on('click.exment_custom_form', '.box-custom_form_block .btn-addallitems', {}, CustomFromEvent.addAllItems);           
            $(document).on('click.exment_custom_form', '.box-custom_form_block .addbutton_button', {}, CustomFromEvent.addAreaButtonEvent);

            $(document).on('change.exment_custom_form', '.box-custom_form_block .changedata_target_column_id', {}, CustomFromEvent.changedataColumnEvent);
            $(document).on('click.exment_custom_form', '#modal-showmodal .modal-customform .modal-submit', {}, CustomFromEvent.settingModalSetting);

            $(document).on('pjax:complete', function (event) {
                CustomFromEvent.AddEvent();
            });
        }

        
        /**
         * Call loading event
         */
        private static loadingEvent() {
            // Add drag item event
            $('.custom_form_column_items .draggables,.custom_form_column_suggests .draggables').each(function(index:number, elem:Element){
                CustomFromEvent.addDragItemEvent($(elem).children('.draggable'));
            });
        }


        /**
         * Append event for suggest item, for loading display.
         * @param $element suggest area list
         */
        public static addDragItemEvent($element: JQuery<Element>){
            let $draggables = $element.closest('.draggables');
            $element.draggable({
                // connect to sortable. set only same block
                // and filter not draggable_setted
                connectToSortable: '.' + $draggables.data('connecttosortable') + ' .draggables',
                helper: $draggables.data('draggable_clone') ? 'clone' : '',
                revert: "invalid",
                droppable: "drop",
                distance: 40,
                stop: (event, ui) => {
                    // if moved to "custom_form_column_items"(for form) ul, show delete button and open detail.
                    if (ui.helper.closest('.custom_form_column_items').length > 0) {
                        CustomFromEvent.setMovedEvent(ui.helper);
                    }
                }
            });

            // set event for fix area   
            $(".custom_form_column_items .draggables")
                .sortable({
                    distance: 40,
            })
        }
        

        /**
         * Set event after dragged erea.
         */
        private static setMovedEvent($elem: JQuery<Element>){
            CustomFromEvent.toggleConfigIcon($elem, true);
            // add hidden form
            let header_name = CustomFromEvent.getHeaderName($elem);
            $elem.append($('<input/>', {
                name: header_name + '[form_column_target_id]',
                value: $elem.find('.form_column_target_id').val(),
                type: 'hidden',
            }));
            $elem.append($('<input/>', {
                name: header_name + '[form_column_type]',
                value: $elem.find('.form_column_type').val(),
                type: 'hidden',
            }));
            $elem.append($('<input/>', {
                name: header_name + '[required]',
                value: $elem.find('.required').val(),
                type: 'hidden',
            }));
            $elem.append($('<input/>', {
                name: header_name + '[row_no]',
                value: $elem.closest('[data-row_no]').data('row_no'),
                'class': 'row_no',
                type: 'hidden',
            }));
            $elem.append($('<input/>', {
                name: header_name + '[column_no]',
                value: $elem.closest('[data-column_no]').data('column_no'),
                'class': 'column_no',
                type: 'hidden',
            }));

            // rename for toggle
            if(hasValue($elem.find('[data-toggle]'))){
                let uuid = getUuid();
                $elem.find('[data-parent]')
                    .attr('data-parent', '#' + uuid)
                    .attr('href', '#' + uuid);
                $elem.find('.panel-collapse').prop('id', uuid);
            }

            // replace html name(for clone object)
            CustomFromEvent.replaceCloneColumnName($elem);
        }


        private static addAreaButtonEvent = (ev) => {
            let $button = $(ev.target).closest('.addbutton_button');

            let $copy: JQuery<HTMLElement> = null;
            $copy = $('.template_item_column .custom_form_area').clone(true);
            $button.closest('.addbutton_block').before($copy);

            // update data row and column no
            CustomFromEvent.updateAreaRowNo($copy);
            CustomFromEvent.updateAreaColumnNo($copy);

            // toggle plus button
            CustomFromEvent.togglePlusButton($button);

            CustomFromEvent.appendRow($copy);

            CustomFromEvent.addDragItemEvent($copy);
        }

        
        private static togglePlusButton($button: JQuery<HTMLElement>)
        {
            let $items = $button.closest('.row').children('.custom_form_area:visible');
            // calc size
            let allWidth = 0;
            $items.each(function(index, element){
                allWidth += $(element).find('[data-width]').data('width');
            });

            if(allWidth >= 4){
                $button.closest('.addbutton_block').hide();
            }
            else{
                $button.closest('.addbutton_block').show();
            }
        }

        /**
         * Update row no. area and each items
         * @param $elem 
         */
        private static updateAreaRowNo($elem: JQuery<HTMLElement>)
        {
            // update data row and column no
            let row = $elem.closest('.custom_form_column_items').children('.row:visible').index($elem.closest('.row')) + 1;
            $elem.find('.draggables').data('row_no', row);

            // update items row no
            $elem.find('.row_no').val(row);
        }
        
        /**
         * Update column no. area and each items
         * @param $elem 
         */
        private static updateAreaColumnNo($elem: JQuery<HTMLElement>)
        {
            // update data row and column no
            let column = $elem.closest('.row').children('.custom_form_area:visible').index($elem.closest('.custom_form_area')) + 1;
            $elem.find('.draggables').data('column_no', column);

            // update items column no
            $elem.find('.column_no').val(column);
        }


        private static appendRow($copy){
            if($copy.find('[data-column_no]').data('column_no') != 1){
                return;
            }
            let $rowcopy = $('.template_item_row .row').clone(true);
            
            $copy.closest('.custom_form_column_items').append($rowcopy);
        }
        

        /**
         * Add All item button event
         */
        private static addAllItems = (ev) => {
            let $block = $(ev.target).closest('.custom_form_column_block_inner');
            let $items = $block.find('.custom_form_column_item:visible'); // ignore template item
            let $target_ul = $block.closest('.box-body').find('.custom_form_column_items .draggables').first();
            $items.each(function(index:number, elem:Element){
                $(elem).appendTo($target_ul);
                // show item options, 
                CustomFromEvent.setMovedEvent($(elem));
                //CustomFromEvent.toggleFormColumnItem($(elem), true);
            });
        }


        // private static setDragItemEvent($elem, initialize = true){
        //     // get parent div
        //     var $div = $elem.parents('.custom_form_column_block');
        //     // get id name for connectToSortable
        //     var id = 'ul_' 
        //         + $div.data('form_block_type') 
        //         + '_' + $div.data('form_block_target_table_id')
        //         //+ '_' + ($div.data('form_column_no') == 1 ? 2 : 1);
        //     if(initialize){
        //         $elem.draggable({
        //             // connect to sortable. set only same block
        //             connectToSortable: '.' + id,
        //             //cursor: 'move',
        //             revert: "invalid",
        //             droppable: "drop",
        //             distance: 40,
        //             stop: (event, ui) => {
        //                 // reset draageble target
        //                 CustomFromEvent.setDragItemEvent(ui.helper, false);
        //                 // set column no
        //                 ui.helper.find('.column_no').val(ui.helper.closest('[data-form_column_no]').data('form_column_no'));
        //             }
        //         });
        //     }else{
        //         $elem.draggable( "option", "connectToSortable", "." + id );
        //     }
        // }


        private static toggleConfigIcon($elem: JQuery<Element>, isShow:boolean){
            if(isShow){
                $elem.find('.delete,.options,[data-toggle],.setting').show();
            }else{
                $elem.find('.delete,.options,[data-toggle],.setting').hide();
            }
        }

        // private static toggleFormColumnItem($elem: JQuery<Element>, isShow = true) {
        //     CustomFromEvent.toggleConfigIcon($elem, isShow);

        //     if(isShow){
        //         // add hidden form
        //         var header_name = CustomFromEvent.getHeaderName($elem);
        //         $elem.append($('<input/>', {
        //             name: header_name + '[form_column_target_id]',
        //             value: $elem.find('.form_column_target_id').val(),
        //             type: 'hidden',
        //         }));
        //         $elem.append($('<input/>', {
        //             name: header_name + '[form_column_type]',
        //             value: $elem.find('.form_column_type').val(),
        //             type: 'hidden',
        //         }));
        //         CustomFromEvent.setDragItemEvent($elem);
        //     }
        // }
        
        private static toggleFromBlock = (ev) => {
            ev.preventDefault();
            
            var available = $(ev.target).closest('.icheck_toggleblock').prop('checked');
            var $block = $(ev.target).closest('.box-custom_form_block').find('.custom_form_block');
            if (available) {
                $block.show();
            } else {
                $block.hide();
            }
        }

        private static deleteColumn = (ev) => {
            ev.preventDefault();

            var item = $(ev.target).closest('.custom_form_column_item');
            if(item.hasClass('deleting')){
                return;
            }
            item.addClass('deleting');

            var header_name = CustomFromEvent.getHeaderName(item);
            // Add delete flg
            item.append($('<input/>', {
                type: 'hidden',
                name: header_name + '[delete_flg]',
                value: 1
            }));
            item.fadeOut();
            if (item.find('.form_column_type').val() != '99') {
                var form_column_type = item.find('.form_column_type').val();
                var form_column_target_id = item.find('.form_column_target_id').val();
                var form_block_type = item.closest('.custom_form_column_block').data('form_block_type');
                var form_block_target_table_id = item.closest('.custom_form_column_block').data('form_block_target_table_id');

                // get suggest_form_column_type.
                if(form_column_type == '1'){
                   var suggest_form_column_type:any = '0';
                }else{
                    suggest_form_column_type = form_column_type;
                }

                // get target suggest div area.
                var $custom_form_block_target = $('.custom_form_column_block')
                .filter('[data-form_block_type="' + form_block_type + '"]')
                .filter('[data-form_block_target_table_id="' + form_block_target_table_id + '"]');

                var $custom_form_column_suggests = $custom_form_block_target
                    .find('.custom_form_column_suggests')
                    .filter('[data-form_column_type="' + suggest_form_column_type + '"]');
                // find the same value hidden in suggest ul.
                var $template = $custom_form_block_target.find('[data-form_column_target_id="' + form_column_target_id + '"]')
                    .filter('[data-form_column_type="' + form_column_type + '"]');
                if ($template) {
                    var $clone: any = $template.children('.custom_form_column_item').clone(true);
                    $clone.appendTo($custom_form_column_suggests).show();

                    CustomFromEvent.loadingEvent($clone);
                }
            }
        }

        private static getHeaderName($li: JQuery<Element>): string {
            var header_name = $li.closest('.box-custom_form_block').find('.header_name').val() as string;
            var header_column_name = $li.find('.header_column_name').val() as string;
            return header_name + header_column_name;
        }

        private static formSubmitEvent = () => {
            // loop "custom_form_block_available" is 1
            let hasRequire = false;
            if(!$('form.custom_form_form').hasClass('confirmed')){
                $('.custom_form_block_available').each(function(index, elem){
                    // if elem's value is not 1, continue.
                    if(!pBool($(elem).val())){
                        return true;
                    }
                    // if not check, continue
                    if($(elem).is(':checkbox') && !$(elem).is(':checked')){
                        return true;
                    }

                    let $suggests = $(elem).parents('.box-custom_form_block').find('.custom_form_column_suggests li');
                    // if required value is 1, hasRequire is true and break
                    $suggests.each(function(i, e){
                        if($(e).find('.required').val() == '1'){
                            hasRequire = true;
                            return false;
                        }
                    })
                });
            }

            if(!hasRequire){
                CustomFromEvent.ignoreSuggests();
                return true;
            }

            // if has require, show swal
            CommonEvent.ShowSwal(null, {
                title: $('#cofirm_required_title').val(),
                text: $('#cofirm_required_text').val(),
                confirmCallback: function(result){
                    if(pBool(result.value)){
                        $('form.custom_form_form').addClass('confirmed').submit();
                    }
                },
            });

            return false;
        }
        

        private static ignoreSuggests = () => {
            $('.custom_form_column_suggests,.template_item_block').find('input,textarea,select,file').attr('disabled', 'disabled');
            return true;
        }

        static appendSwitchEvent($elem) {
            $elem.each(function (index, elem) {
                var $e = $(elem);
                $e.bootstrapSwitch({
                    size:'small',
                    onText: 'YES',
                    offText: 'NO',
                    onColor: 'primary',
                    offColor: 'default',
                    onSwitchChange: function(event, state) {
                        $(event.target).closest('.bootstrap-switch').next().val(state ? '1' : '0').change();
                    }
                });
            });
        }
        private static appendIcheckEvent($elem: JQuery<Element>) {
            $elem.each(function(index, elem){
                var $e = $(elem);
                if (!$e.data('ichecked')) {
                    $e.iCheck({ checkboxClass: 'icheckbox_minimal-blue' });
                    $e.data('ichecked', true);
                }    
            });
        }

        /**
         * Replace clone suggest li name.
         * @param $li 
         */
        private static replaceCloneColumnName($li){
            let replaceHeaderName = $li.data('header_column_name');
            let $replaceLi = $li.parents('.custom_form_block')
                .find('.custom_form_column_suggests')
                .find('.custom_form_column_item[data-header_column_name="' + replaceHeaderName + '"]');

            if($replaceLi.length == 0){
                return;
            }

            // get "NEW__" string
            let newCode = replaceHeaderName.match(/NEW__.{8}-.{4}-.{4}-.{4}-.{12}/);
            if(!newCode){
                return;
            }

            // set replaced name
            let updateCode = 'NEW__' + getUuid();

            // replace inner
            let html = $replaceLi.html();
            html = html.replace(new RegExp(newCode[0], "g"), updateCode);
            $replaceLi.html(html);

            // replace li id and header_column_name
            let newHeaderName = replaceHeaderName.replace(new RegExp(newCode[0], "g"), updateCode);
            $replaceLi.attr('data-header_column_name', newHeaderName);
            $replaceLi.attr('id', newHeaderName);
        }


        private static changedataColumnEvent = (ev:any, changedata_column_id?) => {
            var $d = $.Deferred();
            // get custom_column_id
            // when changed changedata_target_column 
            if(typeof ev.target != "undefined"){
                var custom_column_id:any = $(ev.target).val();
            }
            // else, selected id
            else{
                var custom_column_id:any = ev;
            }

            if(!hasValue(custom_column_id)){
                $('.changedata_column_id').children('option').remove();
                $d.resolve();
            }
            else{
                $.ajax({
                    url: admin_url(URLJoin('webapi', 'target_table', 'columns', custom_column_id)),
                    type: 'GET'
                })
                .done(function (data) {
                    $('.changedata_column_id').children('option').remove();
                    $('.changedata_column_id').append($('<option>').val('').text(''));
                    $.each(data, function (value, name) {
                        var $option = $('<option>')
                            .val(value as string)
                            .text(name)
                            .prop('selected', changedata_column_id == value);
                            $('.changedata_column_id').append($option);
                    });
                    $d.resolve();
                })
                .fail(function (data) {
                    console.log(data);
                    $d.reject();
                });
            }

            return $d.promise();
        }


        private static settingModalEvent = (ev:JQueryEventObject) => {
            let formItem = CustomFromItem.makeByHidden($(ev.target).closest('.custom_form_column_item'));
            formItem.showSettingModal($(ev.target).closest('.setting'));
        }
 
        
        /**
         * Settng modal Setting
         */
        private static settingModalSetting = (ev) => {
            ev.preventDefault();

            let formItem = CustomFromItem.makeByModal();
            let options = formItem.getOption();
            let $modal = $('#modal-showmodal');

            // get target_header_column_name for updating.
            let widgetmodal_uuid = $modal.find('.widgetmodal_uuid').val();
            let $target_li = $('[data-widgetmodal_uuid="' + widgetmodal_uuid + '"]').closest('.custom_form_column_item');
            
            // data setting and show message
            $target_li.find('.options').val(JSON.stringify(options));

            // move image event
            let header_name = CustomFromEvent.getHeaderName($target_li);
            $target_li.find('.image').remove();
            $modal.find('.image').appendTo($target_li).prop('name', header_name + '[options][image]').hide();

            $modal.modal('hide');
        }
    }
}
$(function () {
    Exment.CustomFromEvent.AddEvent();
    Exment.CustomFromEvent.AddEventOnce();
});
