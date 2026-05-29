<?php

namespace App\DataObjects;

class Notification
{
    protected string $title = '';

    protected array $lines = [];

    protected array $extras = [];

    public function title(string $title): self
    {
        $this->title = $title;

        return $this;
    }

    public function line(string $line): self
    {
        $this->lines[] = $line;

        return $this;
    }

    public function with(string $key, $value): self
    {
        $this->extras[$key] = $value;

        return $this;
    }

    /**
     * Build the payload stored in the notification's data column.
     */
    public function getData(): array
    {
        return [
            'title' => $this->title,
            'message' => implode(' ', array_map('trim', $this->lines)),
            ...$this->extras,
        ];
    }
}
