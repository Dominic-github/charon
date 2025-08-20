<?php

namespace App\Http\Requests\API;

use Illuminate\Validation\Rules\Password;

/**
 * @property string $fullName
 * @property string $email
 * @property string $password
 * @property string $rePassword
 */
class UserRegisterRequest extends Request
{
    /** @return array<mixed> */
    public function rules(): array
    {
        return [
            'fullName' => 'required',
            'email' => 'required|email',
            'password' => ['required', Password::defaults()],
            'rePassword' => ['required', Password::defaults()],
        ];
    }
}
