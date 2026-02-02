const mem0Config = {
    apiKey: process.env.MEM0_API_KEY,
    agentId: process.env.MEM0_AGENT_ID || 'resonate-health-agent',
    projectName: process.env.MEM0_PROJECT_NAME || 'resonate-health-memory',
    baseUrl: 'https://api.mem0.ai/v1'
};

const validateMem0Config = () => {
    if (!mem0Config.apiKey) {
        throw new Error('MEM0_API_KEY is not defined in environment variables');
    }
    return true;
};

export { mem0Config, validateMem0Config };
