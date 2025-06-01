const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const express = require('express')
const cors = require('cors');
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Career code running on server');
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dpqzrtb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();

        const jobsCollections = client.db('career-code').collection('jobs');
        const applicationCollections = client.db('career-code').collection('applications')


        // Find All Jobs

        app.get('/jobs', async (req, res) => {
            const cursor = jobsCollections.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        // Find One Jobs

        app.get('/jobs/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await jobsCollections.findOne(query);
            res.send(result)
        })


        // Job applications APIs

        app.post('/applications', async (req, res) => {
            const { application } = req.body;
            const result = await applicationCollections.insertOne(application);
            res.send(result)
        })

        app.get('/applications', async (req, res) => {
            const email = req.query.email;
            const query = {applicant:email};
            const cursor = applicationCollections.find(query)
            const result = await cursor.toArray();
            

            // Bad way to data aggregate
            
            for(application of result){
                const jobId = application.jobID;
                const jobQurey = {_id: new ObjectId(jobId)}
                const job = await jobsCollections.findOne(jobQurey);
                application.company = job.company;
                application.category = job.category;
                application.company_logo = job.company_logo
            }
            res.send(result)
        })


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {

    }
}
run().catch(console.dir);



app.listen(port, () => {
    console.log(`Career code running on server ${port}`)
})