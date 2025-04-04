<?php

namespace App\Http\Requests\API;

use App\Models\Song;
use Illuminate\Validation\Rule;

/**
 * @property-read array<string> $songs
 */
class ChangeSongsVisibilityRequest extends Request
{
    /** @return array<mixed> */
    public function rules(): array
    {
        return [
            'songs' => ['required', 'array', Rule::exists(Song::class, 'id')],
        ];
    }

    public function authorize(): bool
    {
        return true;
    }
}
