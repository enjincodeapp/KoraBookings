<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * Display a listing of the resource.
     */

//  Display a listing of the users.

    public function index()
    {
        // simply return all users for now, but in a real application you would want to paginate this and add filtering/sorting
        return response()->json(\App\Models\User::all());
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        // Show specific user by ID. In a real app, you would want to add authorization checks here to ensure users can only see their own data (or admins can see all).
        $user = \App\Models\User::findOrFail($id);
        return response()->json($user);
        
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
