const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const multer = require('multer');
const bodyParser = require('body-parser');
const session = require('express-session');
const app = express();
const bcrypt = require('bcrypt');
const saltRounds = 10;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'c237_calendarapp'
});

connection.connect((error) => {
  if (error) {
    console.error('Error connecting to MySQL:', error);
    return;
  }
  console.log('Connected to MySQL database');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.use(express.static('public'))

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using https
}));

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.get('/login', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ?';
  connection.query(sql, [username], async (err, results) => {
    if (err) {
      console.error('Database query error:', err.message);
      return res.status(500).send('Error logging in');
    }
    if (results.length > 0) {
      const user = results[0];
      const match = await bcrypt.compare(password, user.password);
      if (match) {
        req.session.user = user;
        return res.redirect('/');
      }
    }
    res.status(401).send('Invalid username or password');
  });
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  
  bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error('Error hashing password:', err);
      return res.status(500).send('Error creating user');
    }

    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    connection.query(sql, [username, hashedPassword], (error, results) => {
      if (error) {
        console.error('Error creating user:', error.message);
        return res.status(500).send('Error creating user');
      }
      console.log('User created successfully');
      res.redirect('/login');
    });
  });
});


const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};


app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

const months = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

app.get('/',isAuthenticated, (req, res) => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  res.redirect(`/calendar/${currentYear}/${currentMonth}`);
});

app.get('/all', (req, res) => {
  const sql = 'SELECT * FROM plans';
  connection.query(sql, (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.status(500).send('Error Retrieving plans');
    }
    res.render('showAll', {plans: results});
  });
});

app.get('/calendar/:year/:month', (req, res) => {
  const year = parseInt(req.params.year);
  const month = parseInt(req.params.month);

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const firstDayOfWeek = firstDay.getDay();

  let calendar = [];
  let week = new Array(7).fill(null);
  let day = 1;

  for (let i = firstDayOfWeek; i < 7; i++) {
    week[i] = { date: day++, inMonth: true };
  }
  calendar.push(week);

  while (day <= daysInMonth) {
    week = new Array(7).fill(null);
    for (let i = 0; i < 7 && day <= daysInMonth; i++) {
      week[i] = { date: day++, inMonth: true };
    }
    calendar.push(week);
  }

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;

  res.render('index', {
    calendar,
    currentYear: year,
    currentMonth: month,
    months,
    daysOfWeek,
    prevMonth,
    prevYear,
    nextMonth,
    nextYear
  });
});

app.get('/plan/:date', (req, res) => {
  const date = req.params.date;
  const sql = 'SELECT * FROM plans WHERE date = ?';
  connection.query(sql, [date], (error, results) => {
    if (error) {
      console.error('SQL query error:', error.message);
      return res.status(500).send('Error retrieving plan by date');
    }
    res.render('plan', {
      plans: results,
      selectedDate: date
    });
  });
});

app.get('/editPlan/:Id', (req, res) => {
  const planId = req.params.Id;
  const sql = 'SELECT * FROM plans WHERE planId = ?';
  connection.query( sql , [planId], (error, results) => {
      if (error) {
          console.error('Database query error:', error.message);
          return res.status(500).send('Error Retrieving plans by ID');
      }
      if (results.length > 0){
        res.render('editPlan', {plan: results[0]});
      } else {
        res.status(404).send('Plan not found');
      }
});
});

app.post('/editPlan/:id', upload.single('image'), (req, res) => {
  const planId = req.params.id;
  const { date, time, plan } = req.body;
  let image = req.body.currentImage;

  if (req.file) {
    image = req.file.filename;
  }

  // Only update fields that are provided
  const updates = {};
  if (date) updates.date = date;
  if (time) updates.time = time;
  if (plan) updates.plan = plan;
  if (image) updates.image = image;

  const fields = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = Object.values(updates);
  values.push(planId);

  const sql = `UPDATE plans SET ${fields} WHERE planId = ?`;

  connection.query(sql, values, (error, results) => {
    if (error) {
      console.error("Error updating plan:", error);
      return res.status(500).send('Error updating plan');
    }
    res.redirect('/');
  });
});


app.get('/deletePlan/:Id', (req, res) => {
const planId = req.params.Id;
const sql = 'DELETE FROM plans WHERE planId = ?';
connection.query( sql , [planId], (error, results) => {
    if (error) {
        console.error('Error deleting plan:', error);
        res.status(500).send('Error deleting plan');
    } else {
      res.redirect('/');
    }
});
});

app.get('/deleteAll', (req, res) => {
  const plan = req.params;
  const sql = 'DELETE FROM plans';
  connection.query( sql , (error, results) => {
      if (error) {
          console.error('Error deleting plan:', error);
          res.status(500).send('Error deleting plan');
      } else {
        res.redirect('/');
      }
  });
  });

app.get('/addPlan/:date', (req, res) => {
  const date = req.params.date;
  res.render('addPlan', { selectedDate: date });
});

app.get('/addPlan', (req, res) => {
  const date = req.params.date;
  res.render('addPlan');
});

app.post('/addPlan', upload.single('image'), (req, res) => {
  const { date, time, plan} = req.body;
  let image;
  if (req.file){
    image = req.file.filename;
  }else{
    image = null;
  }
  const sql = 'INSERT INTO plans (date, time, plan, image) VALUES (?, ?, ?, ?)';
  connection.query( sql, [date, time, plan, image], (error, results) => {
      if (error) {
          // Handle any error that occurs during the database operation
          console.error("Error adding plan:", error);
          res.status(500).send('Error adding plan');
      } else {
          // Send a success response
          res.redirect('/');
      }
  });
});

app.get('/prevMonth', (req, res) => {
  const month = parseInt(req.query.month);
  const year = parseInt(req.query.year);
  const newDate = new Date(year, month - 1, 1);
  res.redirect(`/calendar/${newDate.getFullYear()}/${newDate.getMonth()}`);
});

app.get('/nextMonth', (req, res) => {
  const month = parseInt(req.query.month);
  const year = parseInt(req.query.year);
  const newDate = new Date(year, month + 1, 1);
  res.redirect(`/calendar/${newDate.getFullYear()}/${newDate.getMonth()}`);
});

app.get('/changeMonth', (req, res) => {
  let month = parseInt(req.query.month);
    if (month >= 12){
      month = 0
    }
    if (month <= -1){
      month = 11
    }
  const year = parseInt(req.query.year);
  res.redirect(`/calendar/${year}/${month}`);
});

app.get('/changeYear', (req, res) => {
  const year = parseInt(req.query.year);
  const month = parseInt(req.query.month);
  res.redirect(`/calendar/${year}/${month}`);
});

app.get('/goToToday', (req, res) => {
  const today = new Date();
  res.redirect(`/calendar/${today.getFullYear()}/${today.getMonth()}`);
});

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
