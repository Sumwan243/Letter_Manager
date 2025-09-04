<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\LetterTemplate;

class LetterTemplateController extends Controller
{
    public function index()
    {
        return response()->json(LetterTemplate::latest()->paginate(15));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'company_name' => 'required|string|max:255',
            'address_line1' => 'required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'date' => 'required|date',
            'recipient_name' => 'required|string|max:255',
            'recipient_title' => 'nullable|string|max:255',
            'recipient_company' => 'nullable|string|max:255',
            'recipient_address1' => 'required|string|max:255',
            'recipient_address2' => 'nullable|string|max:255',
            'salutation' => 'required|string|max:255',
            'paragraph1' => 'required|string',
            'paragraph2' => 'nullable|string',
            'paragraph3' => 'nullable|string',
            'closing' => 'required|string|max:255',
            'sender_name' => 'required|string|max:255',
            'sender_title' => 'nullable|string|max:255',
            'sender_contact' => 'nullable|string|max:255',
            'sender_email' => 'nullable|email|max:255',
        ]);

        $template = LetterTemplate::create($validated);

        return response()->json(['template' => $template], 201);
    }

    public function show(LetterTemplate $letterTemplate)
    {
        return response()->json($letterTemplate);
    }

    public function update(Request $request, LetterTemplate $letterTemplate)
    {
        $validated = $request->validate([
            'company_name' => 'sometimes|required|string|max:255',
            'address_line1' => 'sometimes|required|string|max:255',
            'address_line2' => 'nullable|string|max:255',
            'date' => 'sometimes|required|date',
            'recipient_name' => 'sometimes|required|string|max:255',
            'recipient_title' => 'nullable|string|max:255',
            'recipient_company' => 'nullable|string|max:255',
            'recipient_address1' => 'sometimes|required|string|max:255',
            'recipient_address2' => 'nullable|string|max:255',
            'salutation' => 'sometimes|required|string|max:255',
            'paragraph1' => 'sometimes|required|string',
            'paragraph2' => 'nullable|string',
            'paragraph3' => 'nullable|string',
            'closing' => 'sometimes|required|string|max:255',
            'sender_name' => 'sometimes|required|string|max:255',
            'sender_title' => 'nullable|string|max:255',
            'sender_contact' => 'nullable|string|max:255',
            'sender_email' => 'nullable|email|max:255',
        ]);

        $letterTemplate->update($validated);
        return response()->json(['template' => $letterTemplate]);
    }

    public function destroy(LetterTemplate $letterTemplate)
    {
        $letterTemplate->delete();
        return response()->json(['message' => 'Deleted']);
    }
}


