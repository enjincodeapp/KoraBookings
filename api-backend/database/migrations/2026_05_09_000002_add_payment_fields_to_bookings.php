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
        Schema::table('bookings', function (Blueprint $table) {
            // Add payment_status column
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded'])->default('pending')->after('status');
            
            // Add transaction relationship
            $table->foreignId('transaction_id')->nullable()->constrained('transactions')->cascadeOnDelete()->after('payment_status');
            
            // Add cancellation tracking
            $table->timestamp('cancelled_at')->nullable()->after('transaction_id');
            $table->text('cancellation_reason')->nullable()->after('cancelled_at');
            
            // Add guest contact info for payment receipt
            $table->string('guest_email')->nullable()->after('cancellation_reason');
            $table->string('guest_phone')->nullable()->after('guest_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn('payment_status');
            $table->dropForeign('bookings_transaction_id_foreign');
            $table->dropColumn('transaction_id');
            $table->dropColumn('cancelled_at');
            $table->dropColumn('cancellation_reason');
            $table->dropColumn('guest_email');
            $table->dropColumn('guest_phone');
        });
    }
};
