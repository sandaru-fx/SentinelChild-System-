
import os
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

# MongoDB connection details
MONGO_URI = "mongodb+srv://sandaruchamod62_db_user:sandaru2020@cluster0.hnkt4gn.mongodb.net/sentinel_child?retryWrites=true&w=majority&appName=Cluster0&authSource=admin"
DB_NAME = "sentinel_child"

def seed_data():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    resources_collection = db["resources"]

    # Clear existing resources to avoid duplicates during seeding
    resources_collection.delete_many({})

    educational_posts = [
        {
            "title": "Understanding Your Safety: A Guide for Kids",
            "description": "Learn how to stay safe at school, home, and on the playground. Empower yourself with knowledge.",
            "type": "ARTICLE",
            "icon": "/src/assets/resources/child_safety.png",
            "readTime": "5 Min Read",
            "content": """
## Safety is Your Right!

Every child deserves to feel safe and protected. Here are some key things to remember:

### 1. The Power of 'No'
If someone makes you feel uncomfortable, you have the right to say 'NO' loudly and clearly.

### 2. Trusted Adults
Identify three 'Safety Adults' in your life—people you can talk to about anything. This could be a parent, a teacher, or a grandparent.

### 3. Personal Boundaries
Your body belongs to you. No one should touch you in a way that makes you feel scared or confused.

### 4. Immediate Help
If you are in danger, call **1929** (Childline Sri Lanka) or use the SOS button in this app.
            """,
            "category": "General Safety",
            "language": "en",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "title": "ඔබේ ආරක්ෂාව තේරුම් ගැනීම: දරුවන් සඳහා මාර්ගෝපදේශයක්",
            "description": "පාසලේදී, නිවසේදී සහ ක්‍රීඩා පිටියේදී ආරක්ෂිතව සිටින ආකාරය ඉගෙන ගන්න. දැනුමෙන් ඔබව සවිබල ගන්වන්න.",
            "type": "ARTICLE",
            "icon": "/src/assets/resources/child_safety.png",
            "readTime": "විනාඩි 5 කියවීමක්",
            "content": """
## ආරක්ෂාව ඔබේ අයිතියයි!

සෑම දරුවෙකුටම ආරක්ෂිතව සහ රැකවරණය ලැබීමට අයිතියක් ඇත. මතක තබා ගත යුතු වැදගත් කරුණු කිහිපයක් මෙන්න:

### 1. 'එපා' කීමේ බලය
යමෙකු ඔබව අපහසුවට පත් කරන්නේ නම්, ශබ්ද නගා 'එපා' යැයි පැවසීමට ඔබට අයිතියක් ඇත.

### 2. විශ්වාසවන්ත වැඩිහිටියන්
ඔබේ ජීවිතයේ 'ආරක්ෂිත වැඩිහිටියන්' තිදෙනෙකු හඳුනා ගන්න—ඔබට ඕනෑම දෙයක් ගැන කතා කළ හැකි අය. ඒ දෙමාපියන්, ගුරුවරයෙකු හෝ සීයා/ආච්චි විය හැකිය.

### 3. පෞද්ගලික සීමාවන්
ඔබේ ශරීරය ඔබට අයිති දෙයකි. ඔබ බියට හෝ ව්‍යාකූලත්වයට පත් කරන ආකාරයෙන් කිසිවෙකු ඔබව ස්පර්ශ නොකළ යුතුය.

### 4. ක්ෂණික සහාය
ඔබ අනතුරක සිටී නම්, **1929** (ළමා උපකාරක සේවය) අමතන්න හෝ මෙම යෙදුමේ ඇති SOS බොත්තම භාවිතා කරන්න.
            """,
            "category": "General Safety",
            "language": "si",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "title": "Surfing Safely: Digital Rights and Protection",
            "description": "How to stay safe while playing games and talking to friends online. Protect your digital footprint.",
            "type": "ARTICLE",
            "icon": "/src/assets/resources/digital_safety.png",
            "readTime": "7 Min Read",
            "content": """
## Your Digital World

The internet is a great place to learn and play, but it's important to stay safe!

### 1. Private Information
Never share your real name, address, or school name with people you meet online.

### 2. The 'Think' Rule
Before you post a photo or a comment, think: Would I want my teacher or grandmother to see this?

### 3. Cyberbullying
If someone is being mean to you online, tell a trusted adult immediately. Do not reply to the mean messages.

### 4. Strange Requests
If someone asks you to do something that feels 'wrong' or asks for photos, block them and report it to the CHARS team.
            """,
            "category": "Online Safety",
            "language": "en",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "title": "ආරක්ෂිතව අන්තර්ජාලය භාවිතා කරමු: ඩිජිටල් අයිතිවාසිකම් සහ රැකවරණය",
            "description": "අන්තර්ජාලය හරහා ක්‍රීඩා කිරීමේදී සහ මිතුරන් සමඟ කතා කිරීමේදී ආරක්ෂිතව සිටින ආකාරය. ඔබේ ඩිජිටල් සලකුණ ආරක්ෂා කරගන්න.",
            "type": "ARTICLE",
            "icon": "/src/assets/resources/digital_safety.png",
            "readTime": "විනාඩි 7 කියවීමක්",
            "content": """
## ඔබේ ඩිජිටල් ලෝකය

අන්තර්ජාලය ඉගෙනීමට සහ සෙල්ලම් කිරීමට කදිම ස්ථානයකි, නමුත් ආරක්ෂිතව සිටීම වැදගත්ය!

### 1. පෞද්ගලික තොරතුරු
ඔබ අන්තර්ජාලයෙන් හමුවන පුද්ගලයින් සමඟ ඔබේ සැබෑ නම, ලිපිනය හෝ පාසලේ නම කිසිවිටෙක බෙදා නොගන්න.

### 2. 'සිතන්න' නීතිය
ඡායාරූපයක් හෝ අදහසක් පළ කිරීමට පෙර සිතන්න: මගේ ගුරුවරයා හෝ ආච්චි මෙය දකිනවාට මම කැමතිද?

### 3. සයිබර් හිරිහැර කිරීම්
යමෙකු අන්තර්ජාලය හරහා ඔබට නරක ලෙස සලකන්නේ නම්, වහාම විශ්වාසවන්ත වැඩිහිටියෙකුට පවසන්න.

### 4. අමුතු ඉල්ලීම්
යමෙකු 'වැරදි' යැයි හැඟෙන දෙයක් කිරීමට හෝ ඡායාරූප ඉල්ලා සිටින්නේ නම්, ඔවුන්ව අවහිර කර CHARS කණ්ඩායමට වාර්තා කරන්න.
            """,
            "category": "Online Safety",
            "language": "si",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "title": "Your Voice Matters: Speak Up Against Wrong",
            "description": "Empowering children to report incidents and trust their instincts. You are never alone.",
            "type": "ARTICLE",
            "icon": "/src/assets/resources/youth_voice.png",
            "readTime": "4 Min Read",
            "content": """
## Be Brave, Be Heard

Your voice is your most powerful shield. If you see something wrong happening to you or a friend, don't stay silent.

### 1. Trust Your Tummy
If a situation feels 'yucky' or weird, trust your gut feeling. Get away from that situation quickly.

### 2. Speaking Up is Not Tattling
Telling an adult about a serious problem is being brave, not being a 'snitch'. You are helping to keep everyone safe.

### 3. Helping Friends
If a friend tells you a secret about being hurt, you MUST tell an adult. It's the best way to help your friend.

### 4. We Are Here
The CHARS system is designed to listen to you. We verify every report and take action to protect your future.
            """,
            "category": "Empowerment",
            "language": "en",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "title": "ඔබේ හඬ වැදගත්: වැරැද්දට එරෙහිව කතා කරන්න",
            "description": "සිදුවීම් වාර්තා කිරීමට සහ ඔබේ සහජ බුද්ධිය විශ්වාස කිරීමට දරුවන් සවිබල ගැන්වීම. ඔබ කිසිවිටෙක හුදකලා නොවේ.",
            "type": "ARTICLE",
            "icon": "/src/assets/resources/youth_voice.png",
            "readTime": "විනාඩි 4 කියවීමක්",
            "content": """
## නිර්භීත වන්න, ඔබේ හඬ අවදි කරන්න

ඔබේ හඬ ඔබේ බලවත්ම පලිහයි. ඔබට හෝ මිතුරෙකුට වැරැද්දක් සිදුවන බව ඔබ දුටුවහොත් නිහඬව නොසිටින්න.

### 1. ඔබේ සහජ බුද්ධිය විශ්වාස කරන්න
යම් තත්වයක් ඔබට අපහසුතාවයක් හෝ අමුතු බවක් දැනේ නම්, එම තත්වයෙන් ඉක්මනින් ඉවත් වන්න.

### 2. කතා කිරීම නිර්භීතකමකි
බරපතල ගැටලුවක් ගැන වැඩිහිටියෙකුට පැවසීම නිර්භීතකමකි. ඔබ සැමගේ ආරක්ෂාව වෙනුවෙන් පෙනී සිටින්න.

### 3. මිතුරන්ට උදව් කිරීම
මිතුරෙකු තමාට රිදවන රහසක් ඔබට පැවසුවහොත්, ඔබ අනිවාර්යයෙන්ම වැඩිහිටියෙකුට පැවසිය යුතුය.

### 4. අපි මෙහි සිටිමු
CHARS පද්ධතිය නිර්මාණය කර ඇත්තේ ඔබේ හඬට සවන් දීමටයි. අපි සෑම වාර්තාවක්ම පරීක්ෂා කර පියවර ගන්නෙමු.
            """,
            "category": "Empowerment",
            "language": "si",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]

    faqs = [
        {
            "title": "Mata karadarayak unoth monada karanna ona?",
            "description": "Steps to take during an emergency.",
            "type": "FAQ",
            "icon": "fa-cloud-question",
            "readTime": "1 Min",
            "content": "Speak to a trusted adult immediately, call 1929 (Childline), or use the SOS feature in this app. Your safety is our top priority.",
            "category": "Emergency",
            "language": "en",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "title": "මට කරදරයක් වුනොත් මොකද කරන්න ඕනේ?",
            "description": "හදිසි අවස්ථාවකදී අනුගමනය කළ යුතු පියවර.",
            "type": "FAQ",
            "icon": "fa-cloud-question",
            "readTime": "විනාඩි 1",
            "content": "වහාම විශ්වාසවන්ත වැඩිහිටියෙකුට පවසන්න, 1929 (ළමා උපකාරක සේවය) අමතන්න, හෝ මෙම යෙදුමේ ඇති SOS පහසුකම භාවිතා කරන්න. ඔබේ ආරක්ෂාව අපගේ ප්‍රමුඛතාවයයි.",
            "category": "Emergency",
            "language": "si",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "title": "Is my report truly anonymous?",
            "description": "Privacy details.",
            "type": "FAQ",
            "icon": "fa-shield-check",
            "readTime": "1 Min",
            "content": "Yes, completely. We do not store your name, location, or IP address if you choose the anonymous reporting option.",
            "category": "Privacy",
            "language": "en",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        },
        {
            "title": "මගේ වාර්තාව ඇත්තටම නිර්නාමිකද?",
            "description": "පෞද්ගලිකත්ව තොරතුරු.",
            "type": "FAQ",
            "icon": "fa-shield-check",
            "readTime": "විනාඩි 1",
            "content": "ඔව්, සම්පූර්ණයෙන්ම. ඔබ නිර්නාමික වාර්තා කිරීමේ විකල්පය තෝරා ගන්නේ නම් අපි ඔබේ නම, ස්ථානය හෝ IP ලිපිනය ගබඩා නොකරමු.",
            "category": "Privacy",
            "language": "si",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow()
        }
    ]

    resources_collection.insert_many(educational_posts + faqs)
    print("Successfully seeded resources and FAQs!")

if __name__ == "__main__":
    seed_data()
