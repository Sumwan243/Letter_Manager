<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class ImportUsers extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'users:import {file : The CSV file path}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Import users from a CSV file';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $filePath = $this->argument('file');

        if (!file_exists($filePath)) {
            $this->error("File not found: {$filePath}");
            return 1;
        }

        $this->info("Starting user import from: {$filePath}");
        $this->newLine();

        $file = fopen($filePath, 'r');
        $header = fgetcsv($file); // Read header row
        
        if (!$header || !in_array('email', $header)) {
            $this->error('Invalid CSV format. Required columns: name, email, password, role');
            fclose($file);
            return 1;
        }

        $imported = 0;
        $updated = 0;
        $errors = 0;
        $row = 1;

        $progressBar = $this->output->createProgressBar();
        $progressBar->start();

        while (($data = fgetcsv($file)) !== false) {
            $row++;
            $progressBar->advance();

            // Map CSV columns to array
            $userData = array_combine($header, $data);

            // Validate required fields
            $validator = Validator::make($userData, [
                'name' => 'required|string|max:255',
                'email' => 'required|email|max:255',
                'password' => 'required|string|min:8',
                'role' => 'required|in:admin,executive,staff',
            ]);

            if ($validator->fails()) {
                $errors++;
                $this->newLine();
                $this->warn("Row {$row}: Validation failed - " . $validator->errors()->first());
                continue;
            }

            try {
                // Check if user exists
                $user = User::where('email', $userData['email'])->first();

                if ($user) {
                    // Update existing user
                    $user->update([
                        'name' => $userData['name'],
                        'role' => $userData['role'],
                        // Only update password if it's different
                        'password' => Hash::needsRehash($user->password) ? Hash::make($userData['password']) : $user->password,
                    ]);
                    $updated++;
                } else {
                    // Create new user
                    User::create([
                        'name' => $userData['name'],
                        'email' => $userData['email'],
                        'password' => Hash::make($userData['password']),
                        'role' => $userData['role'],
                    ]);
                    $imported++;
                }
            } catch (\Exception $e) {
                $errors++;
                $this->newLine();
                $this->error("Row {$row}: " . $e->getMessage());
            }
        }

        $progressBar->finish();
        fclose($file);

        $this->newLine(2);
        $this->info("Import completed!");
        $this->table(
            ['Status', 'Count'],
            [
                ['✓ Imported (new)', $imported],
                ['↻ Updated (existing)', $updated],
                ['✗ Errors', $errors],
                ['Total processed', $imported + $updated + $errors],
            ]
        );

        return 0;
    }
}
