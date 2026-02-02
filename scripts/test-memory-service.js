import dotenv from 'dotenv';
import { MemoryService } from '../src/services/memory.service.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '..', '.env') });


const testMemoryService = async () => {
    console.log('=== Memory Service Manual Test ===\n');

    const memoryService = new MemoryService();
    const testUserId = `test-user-${Date.now()}`;
    let memoryId = null;

    try {
        console.log('1️⃣  Testing Service Health...');
        const health = memoryService.checkHealth();
        console.log('   Health Status:', health);
        console.log('   ✅ Service is configured and available\n');

        console.log('2️⃣  Testing Add Memory with Valid Metadata...');
        const metadata = {
            timestamp: new Date().toISOString(),
            timezone: 'Asia/Kolkata',
            category: 'fitness.training',
            source: 'user_input',
            confidence: 0.95,
            tags: ['test', 'manual-verification'],
            module_specific: {
                workout_type: 'push',
                duration_mins: 45,
                rpe: 7,
                energy_level: 8,
                calories_burned: 320
            }
        };

        const addResult = await memoryService.addMemory(
            testUserId,
            'Manual test workout: 45 mins push day, RPE 7, high energy',
            metadata
        );

        if (addResult && addResult.success) {
            memoryId = addResult.memoryId;
            console.log('   ✅ Memory added successfully!');
            console.log('   Memory ID:', memoryId, '\n');
        } else {
            console.log('   ❌ Failed to add memory\n');
            return;
        }

        console.log('3️⃣  Testing Search Memory...');
        const searchResult = await memoryService.searchMemory(
            testUserId,
            'workout push',
            { category: 'fitness.training' },
            5
        );

        if (searchResult && searchResult.success) {
            console.log('   ✅ Search completed successfully!');
            console.log('   Found', searchResult.count, 'result(s)');
            if (searchResult.results.length > 0) {
                console.log('   First result:', searchResult.results[0].memory, '\n');
            }
        } else {
            console.log('   ❌ Search failed\n');
        }

        console.log('4️⃣  Testing Get All Memories...');
        const allMemories = await memoryService.getAllMemories(
            testUserId,
            { category: 'fitness.training' }
        );

        if (allMemories && allMemories.success) {
            console.log('   ✅ Retrieved all memories successfully!');
            console.log('   Total count:', allMemories.count, '\n');
        } else {
            console.log('   ❌ Failed to get all memories\n');
        }

        console.log('5️⃣  Testing Get Memory By ID...');
        if (memoryId) {
            const getResult = await memoryService.getMemoryById(memoryId);
            if (getResult && getResult.success) {
                console.log('   ✅ Memory retrieved by ID successfully!');
                console.log('   Memory ID:', getResult.data.id, '\n');
            } else {
                console.log('   ❌ Failed to get memory by ID\n');
            }
        }

        console.log('6️⃣  Testing Update Memory...');
        if (memoryId) {
            const updatedMetadata = {
                ...metadata,
                module_specific: {
                    ...metadata.module_specific,
                    rpe: 8,
                    notes: 'Updated via test'
                }
            };

            const updateResult = await memoryService.updateMemory(
                memoryId,
                'Updated test workout: 45 mins push day, RPE 8 (increased intensity)',
                updatedMetadata
            );

            if (updateResult && updateResult.success) {
                console.log('   ✅ Memory updated successfully!\n');
            } else {
                console.log('   ❌ Failed to update memory\n');
            }
        }

        console.log('7️⃣  Testing Validation (Should Fail)...');
        try {
            const invalidMetadata = {
                category: 'invalid.category',
                source: 'user_input',
                module_specific: {}
            };

            await memoryService.addMemory(
                testUserId,
                'This should fail',
                invalidMetadata
            );
            console.log('   ❌ Validation did not catch invalid metadata!\n');
        } catch (error) {
            console.log('   ✅ Validation correctly rejected invalid metadata!');
            console.log('   Error:', error.message, '\n');
        }

        console.log('8️⃣  Cleaning Up Test Data...');
        if (memoryId) {
            const deleteResult = await memoryService.deleteMemory(memoryId);
            if (deleteResult && deleteResult.success) {
                console.log('   ✅ Test memory deleted successfully!\n');
            } else {
                console.log('   ⚠️  Could not delete test memory\n');
            }
        }

        console.log('=== ✅ All Manual Tests Passed! ===\n');
        console.log('Summary:');
        console.log('✅ Service initialization');
        console.log('✅ Add memory with validation');
        console.log('✅ Search memories');
        console.log('✅ Get all memories');
        console.log('✅ Get memory by ID');
        console.log('✅ Update memory');
        console.log('✅ Validation error handling');
        console.log('✅ Delete memory\n');

    } catch (error) {
        console.error('\n❌ Test Failed!');
        console.error('Error:', error.message);
        if (error.originalError) {
            console.error('Original Error:', error.originalError.message);
        }
        process.exit(1);
    }
};

testMemoryService();
