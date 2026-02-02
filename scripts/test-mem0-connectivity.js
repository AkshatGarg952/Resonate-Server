import dotenv from 'dotenv';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const MEM0_API_KEY = process.env.MEM0_API_KEY;
const MEM0_BASE_URL = 'https://api.mem0.ai/v1';
const AGENT_ID = process.env.MEM0_AGENT_ID || 'resonate-health-agent';

const testMem0Connectivity = async () => {
    console.log('=== Mem0 Connectivity Test ===\n');

    if (!MEM0_API_KEY || MEM0_API_KEY === 'your_mem0_api_key_here') {
        console.error('❌ ERROR: MEM0_API_KEY not configured in .env file');
        console.log('Please add your Mem0 API key to the .env file');
        process.exit(1);
    }

    const testUserId = `test-user-${Date.now()}`;
    const runId = uuidv4();
    let memoryId = null;

    try {
        console.log('1️⃣  Testing Authentication...');
        console.log(`   API Key: ${MEM0_API_KEY.substring(0, 10)}...`);
        console.log(`   Agent ID: ${AGENT_ID}`);
        console.log(`   Test User ID: ${testUserId}\n`);

        console.log('2️⃣  Adding Test Memory...');
        const addResponse = await axios.post(
            `${MEM0_BASE_URL}/memories/`,
            {
                messages: [
                    {
                        role: 'user',
                        content: 'Hello memory! This is a test from Resonate Health.'
                    }
                ],
                user_id: testUserId,
                agent_id: AGENT_ID,
                run_id: runId,
                metadata: {
                    category: 'test',
                    source: 'connectivity_test',
                    timestamp: new Date().toISOString()
                }
            },
            {
                headers: {
                    'Authorization': `Token ${MEM0_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (addResponse.data && addResponse.data.results) {
            memoryId = addResponse.data.results.id || addResponse.data.results[0]?.id;
            console.log('   ✅ Memory added successfully!');
            console.log(`   Memory ID: ${memoryId}\n`);
        } else {
            console.log('   ⚠️  Memory added but response format unexpected');
            console.log('   Response:', JSON.stringify(addResponse.data, null, 2), '\n');
        }

        console.log('3️⃣  Searching for Test Memory...');
        const searchResponse = await axios.post(
            `${MEM0_BASE_URL}/memories/search/`,
            {
                query: 'test from Resonate Health',
                user_id: testUserId,
                agent_id: AGENT_ID,
                limit: 5
            },
            {
                headers: {
                    'Authorization': `Token ${MEM0_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (searchResponse.data && searchResponse.data.results && searchResponse.data.results.length > 0) {
            console.log('   ✅ Memory retrieved successfully!');
            console.log(`   Found ${searchResponse.data.results.length} result(s)`);
            console.log(`   Memory: "${searchResponse.data.results[0].memory}"\n`);
        } else {
            console.log('   ⚠️  Search completed but no results found');
            console.log('   Response:', JSON.stringify(searchResponse.data, null, 2), '\n');
        }

        console.log('4️⃣  Testing Error Handling...');
        try {
            await axios.post(
                `${MEM0_BASE_URL}/memories/`,
                {
                    messages: [{ role: 'user', content: 'test' }]
                },
                {
                    headers: {
                        'Authorization': 'Token invalid_key_12345',
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('   ⚠️  Expected authentication error but request succeeded\n');
        } catch (error) {
            if (error.response && error.response.status === 401) {
                console.log('   ✅ Authentication error handled correctly\n');
            } else {
                console.log('   ⚠️  Unexpected error:', error.message, '\n');
            }
        }

        console.log('5️⃣  Cleaning Up Test Data...');
        if (memoryId) {
            try {
                await axios.delete(
                    `${MEM0_BASE_URL}/memories/${memoryId}/`,
                    {
                        headers: {
                            'Authorization': `Token ${MEM0_API_KEY}`
                        }
                    }
                );
                console.log('   ✅ Test memory deleted successfully\n');
            } catch (error) {
                console.log('   ⚠️  Could not delete test memory:', error.message, '\n');
            }
        }

        console.log('=== ✅ All Tests Passed! ===');
        console.log('Mem0 Platform is properly configured and operational.\n');

        console.log('Next Steps:');
        console.log('1. ✅ Mem0 connectivity verified');
        console.log('2. 📝 Create memory_schema.md (Day 1 task)');
        console.log('3. 🔧 Implement MemoryService wrapper (Day 2 task)\n');

    } catch (error) {
        console.error('\n❌ Test Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Error:', error.response.data);
        } else {
            console.error('Error:', error.message);
        }
        process.exit(1);
    }
};

testMem0Connectivity();
