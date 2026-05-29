<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppNotificationResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = is_array($this->data) ? $this->data : [];

        return [
            'id' => (string) $this->id,
            'title' => data_get($data, 'title') ?? 'Notification',
            'message' => data_get($data, 'message') ?? data_get($data, 'line') ?? '',
            'type' => class_basename((string) $this->type),
            'is_read' => $this->read_at !== null,
            'read_at' => optional($this->read_at)?->toISOString(),
            'created_at' => optional($this->created_at)?->toISOString(),
            'data' => $data,
        ];
    }
}
