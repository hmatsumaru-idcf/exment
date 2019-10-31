var Exment;
(function (Exment) {
    class WorkflowEvent {
        /**
         * Call only once. It's $(document).on event.
         */
        static AddEventOnce() {
        }
        static AddEvent() {
        }
        static GetSettingValText() {
            const targetKeys = ['work_target_type', 'modal_user', 'modal_organization', 'modal_column', 'modal_system'];
            // get col value item list
            let form = $('[data-contentname="workflow_actions_work_targets"] form');
            // get value
            let val = serializeFromArray(form);
            // filter
            let values = {};
            for (let key in val) {
                if ($.inArray(key, targetKeys) === -1) {
                    continue;
                }
                // remove 'modal_' name.
                values[key.replace('modal_', '')] = val[key];
            }
            let texts = [];
            $.each(targetKeys, function (index, value) {
                let target = form.find('.' + value + '.form-control');
                if (!hasValue(target)) {
                    target = form.find('.' + value + ':checked');
                    if (!hasValue(target)) {
                        return true;
                    }
                }
                if (target.is(':hidden')) {
                    return true;
                }
                // if not select
                if ($.inArray(target.prop('type'), ['select', 'select-multiple']) !== -1) {
                    $.each(target.select2('data'), function (index, value) {
                        texts.push(escHtml(value.text));
                    });
                }
            });
            return { value: JSON.stringify(values), text: texts.join('<br />') };
        }
        static GetConditionSettingValText() {
            const targetKeys = ['workflow_conditions', 'status_to', 'enabled_flg', 'id'];
            // get col value item list
            let form = $('[data-contentname="workflow_actions_work_conditions"] form');
            // get value
            let val = serializeFromArray(form);
            // filter
            let values = {};
            for (let key in val) {
                if (!hasValue(val[key])) {
                    continue;
                }
                let exists = false;
                for (let targetKey in targetKeys) {
                    if (!key.startsWith(targetKeys[targetKey])) {
                        continue;
                    }
                    exists = true;
                    break;
                }
                if (exists) {
                    values[key] = val[key];
                }
            }
            let texts = [];
            form.find('.work_conditions_status_to').each(function (index, element) {
                let target = $(element);
                if (target.is(':hidden')) {
                    return;
                }
                $.each(target.select2('data'), function (index, value) {
                    texts.push(escHtml(value.text));
                });
            });
            return { value: JSON.stringify(values), text: texts.join(',') };
        }
    }
    Exment.WorkflowEvent = WorkflowEvent;
})(Exment || (Exment = {}));
$(function () {
    Exment.ModalEvent.AddEvent();
    Exment.ModalEvent.AddEventOnce();
});
