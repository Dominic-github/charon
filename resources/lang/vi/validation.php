<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | The following language lines contain the default error messages used by
    | the validator class. Some of these rules have multiple versions such
    | as the size rules. Feel free to tweak each of these messages here.
    |
    */

    'accepted' => ':attribute phải được chính xác.',
    'active_url' => ':attribute không phải là một URL hợp lệ.',
    'after' => ':attribute phải là một ngày sau :date.',
    'alpha' => ':attribute chỉ có thể chứa các chữ cái.',
    'alpha_dash' => ':attribute chỉ có thể chứa chữ cái, số và dấu gạch ngang.',
    'alpha_num' => ':attribute chỉ có thể chứa các chữ cái và số.',
    'array' => ':attribute phải là một mảng.',
    'before' => ':attribute phải là một ngày trước :date.',
    'between' => [
        'numeric' => ':attribute phải ở giữa :min và :max.',
        'file' => ':attribute phải ở giữa :min và :max kilobytes.',
        'string' => ':attribute phải ở giữa :min và :max characters.',
        'array' => ':attribute phải ở giữa :min và :max items.',
    ],
    'boolean' => ':attribute trường phải là đúng hoặc sai.',
    'confirmed' => ':attribute nhận đinh không phù hợp.',
    'date' => ':attribute không phải là ngày hợp lệ.',
    'date_format' => ':attribute không phù hợp với định dạng :format.',
    'different' => ':attribute và :other phải khác nhau.',
    'digits' => ':attribute cần phải :digits chữ số.',
    'digits_between' => ':attribute phải ở giữa :min và :max digits.',
    'email' => ':attribute cần phải là một địa chỉ email hợp lệ.',
    'exists' => 'Phần được chọn :attribute không hợp lệ.',
    'filled' => ':attribute là bắt buộc.',
    'image' => ':attribute cần phải là một ảnh.',
    'in' => 'Phần được chọn :attribute không hợp lệ.',
    'integer' => ':attribute cần phải là một số nguyên.',
    'ip' => ':attribute cần phải là một địa chỉ IP hợp lệ.',
    'json' => ':attribute cần phải là một chuỗi JSON hợp lệ.',
    'max' => [
        'numeric' => ':attribute có thể không lớn hơn :max.',
        'file' => ':attribute có thể không lớn hơn :max kilobytes.',
        'string' => ':attribute có thể không lớn hơn :max characters.',
        'array' => ':attribute có thể không có nhiều hơn :max items.',
    ],
    'mimes' => ':attribute cần phải một tập tin kiểu: :values.',
    'min' => [
        'numeric' => ':attribute ít nhất phải là :min.',
        'file' => ':attribute ít nhất phải là :min kilobytes.',
        'string' => ':attribute ít nhất phải là :min characters.',
        'array' => ':attribute ít nhất phải là :min items.',
    ],
    'not_in' => 'Phần được chọn :attribute không hợp lệ.',
    'numeric' => ':attribute cần phải là một số.',
    'regex' => ':attribute format không hợp lệ.',
    'required' => ':attribute field là bắt buộc.',
    'required_if' => ':attribute fieldlà bắt buộc khi :other ở :value.',
    'required_unless' => ':attribute field là bắt buộc trừ khi :other ở trong :values.',
    'required_with' => ':attribute field là bắt buộc khi :values ở hiện tại.',
    'required_with_all' => ':attribute field là bắt buộc khi :values ở hiện tại.',
    'required_without' => ':attribute field là bắt buộc khi :values không ở hiện tại.',
    'required_without_all' => ':attribute field là bắt buộc khi không là :values ở hiện tại.',
    'same' => ':attribute và :other phải trùng nhau.',
    'size' => [
        'numeric' => ':attribute cần phải :size.',
        'file' => ':attribute cần phải :size kilobytes.',
        'string' => ':attribute cần phải :size characters.',
        'array' => ':attribute phải chứa :size items.',
    ],
    'string' => ':attribute cần phải một chuỗi.',
    'timezone' => ':attribute cần phải một vùng hợp lệ.',
    'unique' => ':attribute đã được thực hiện rồi.',
    'url' => ':attribute format không hợp lệ.',

    'path' => [
        'valid' => ':attribute không phải là một đường dẫn hợp lệ hoặc có thể đọc được.',
    ],

    'uploaded' => ':attribute không thể tải lên.',

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Language Lines
    |--------------------------------------------------------------------------
    |
    | Here you may specify custom validation messages for attributes using the
    | convention "attribute.rule" to name the lines. This makes it quick to
    | specify a specific custom language line for a given attribute rule.
    |
    */

    'custom' => [
    ],

    /*
    |--------------------------------------------------------------------------
    | Custom Validation Attributes
    |--------------------------------------------------------------------------
    |
    | The following language lines are used to swap attribute place-holders
    | with something more reader friendly such as E-Mail Address instead
    | of "email". This simply helps us make messages a little cleaner.
    |
    */

    'attributes' => [],
];
