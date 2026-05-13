<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('booking_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // Payment Details
            $table->string('reference')->unique(); // Paystack reference
            $table->enum('payment_method', ['paystack', 'card', 'transfer', 'crypto'])->default('paystack');
            $table->decimal('amount', 10, 2);
            $table->enum('status', ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'])->default('pending');
            
            // Fee breakdown for transparency
            $table->decimal('subtotal', 10, 2); // Base booking price
            $table->decimal('service_fee', 10, 2)->default(0); // Platform fee
            $table->decimal('tax', 10, 2)->default(0); // VAT/Tax
            
            // Paystack specific fields
            $table->string('paystack_authorization_url')->nullable();
            $table->string('paystack_access_code')->nullable();
            $table->json('paystack_response')->nullable(); // Full Paystack response
            
            // Metadata for auditing
            $table->text('description')->nullable();
            $table->json('metadata')->nullable();
            $table->string('receipt_number')->nullable()->unique();
            
            $table->timestamp('paid_at')->nullable();
            $table->timestamp('refunded_at')->nullable();
            $table->timestamps();
            
            // Indexes for performance
            $table->index('booking_id');
            $table->index('user_id');
            $table->index('reference');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
