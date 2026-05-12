require('dotenv').config();
const mongoose = require('mongoose');

const programSchema = new mongoose.Schema({
  title: String,
  ageGroup: String,
  description: String,
  image: String
}, { timestamps: true });

const Program = mongoose.model('Program', programSchema);

const defaultPrograms = [
  {
    title: 'Playgroup',
    ageGroup: '2 - 3 Years',
    description: 'Our playgroup program introduces young children to a structured learning environment through fun, play-based activities that foster social skills and early cognitive development.',
    image: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&q=80&w=400'
  },
  {
    title: 'Nursery',
    ageGroup: '3 - 4 Years',
    description: 'The nursery program focuses on building foundational literacy and numeracy skills, encouraging creativity through art and music, and developing fine and gross motor skills.',
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=400'
  },
  {
    title: 'Kindergarten',
    ageGroup: '4 - 5 Years',
    description: 'Our kindergarten curriculum prepares children for formal schooling by enhancing language abilities, logical thinking, and independent learning in a supportive and engaging atmosphere.',
    image: 'https://images.unsplash.com/photo-1514050630650-70588523c92b?auto=format&fit=crop&q=80&w=400'
  }
];

async function run() {
  await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB');

  // Fix the existing program: change "10-16" age group to "5 - 5 Years"
  const fixed = await Program.findOneAndUpdate(
    { ageGroup: /10-16/ },
    { ageGroup: '5 - 5 Years' },
    { new: true }
  );
  if (fixed) {
    console.log('Fixed existing program:', fixed.title, '->', fixed.ageGroup);
  } else {
    console.log('No program with "10-16" age group found to fix.');
  }

  // Insert default programs if not already present
  for (const p of defaultPrograms) {
    const exists = await Program.findOne({ title: p.title });
    if (!exists) {
      await Program.create(p);
      console.log('Inserted:', p.title);
    } else {
      console.log('Already exists:', p.title);
    }
  }

  console.log('Done!');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
