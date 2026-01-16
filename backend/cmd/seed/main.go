package main

import (
	"context"
	"log"
	"time"

	"github.com/sandaru-fx/SentinelChild-System/backend/db"
	"github.com/sandaru-fx/SentinelChild-System/backend/models"
	"go.mongodb.org/mongo-driver/bson"
)

func main() {
	uri := "mongodb+srv://sandaruchamod62_db_user:sandaru2020@cluster0.hnkt4gn.mongodb.net/sentinel_child?retryWrites=true&w=majority&appName=Cluster0&authSource=admin"
	dbName := "sentinel_child"

	ctx := context.Background()
	client, err := db.Connect(ctx, uri)
	if err != nil {
		log.Fatalf("failed connect mongo: %v", err)
	}
	defer db.Close(ctx, client)

	collection := db.GetCollection(client, dbName, "resources")

	// Clear existing resources
	_, err = collection.DeleteMany(ctx, bson.M{})
	if err != nil {
		log.Fatalf("failed to clear collection: %v", err)
	}

	resources := []interface{}{
		models.Resource{
			Title:       "Understanding Your Safety: A Guide for Kids",
			Description: "Learn how to stay safe at school, home, and on the playground. Empower yourself with knowledge.",
			Type:        models.ResourceTypeArticle,
			Icon:        "/frontend/assets/resources/child_safety.png",
			ReadTime:    "5 Min Read",
			Content: `
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
`,
			Category:  "General Safety",
			Language:  "en",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		models.Resource{
			Title:       "ඔබේ ආරක්ෂාව තේරුම් ගැනීම: දරුවන් සඳහා මාර්ගෝපදේශයක්",
			Description: "පාසලේදී, නිවසේදී සහ ක්‍රීඩා පිටියේදී ආරක්ෂිතව සිටින ආකාරය ඉගෙන ගන්න. දැනුමෙන් ඔබව සවිබල ගන්වන්න.",
			Type:        models.ResourceTypeArticle,
			Icon:        "/frontend/assets/resources/child_safety.png",
			ReadTime:    "විනාඩි 5 කියවීමක්",
			Content: `
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
`,
			Category:  "General Safety",
			Language:  "si",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		models.Resource{
			Title:       "Surfing Safely: Digital Rights and Protection",
			Description: "How to stay safe while playing games and talking to friends online. Protect your digital footprint.",
			Type:        models.ResourceTypeArticle,
			Icon:        "/frontend/assets/resources/digital_safety.png",
			ReadTime:    "7 Min Read",
			Content: `
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
`,
			Category:  "Online Safety",
			Language:  "en",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		models.Resource{
			Title:       "ආරක්ෂිතව අන්තර්ජාලය භාවිතා කරමු: ඩිජිටල් අයිතිවාසිකම් සහ රැකවරණය",
			Description: "අන්තර්ජාලය හරහා ක්‍රීඩා කිරීමේදී සහ මිතුරන් සමඟ කතා කිරීමේදී ආරක්ෂිතව සිටින ආකාරය. ඔබේ ඩිජිටල් සලකුණ ආරක්ෂා කරගන්න.",
			Type:        models.ResourceTypeArticle,
			Icon:        "/frontend/assets/resources/digital_safety.png",
			ReadTime:    "විනාඩි 7 කියවීමක්",
			Content: `
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
`,
			Category:  "Online Safety",
			Language:  "si",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		models.Resource{
			Title:       "Your Voice Matters: Speak Up Against Wrong",
			Description: "Empowering children to report incidents and trust their instincts. You are never alone.",
			Type:        models.ResourceTypeArticle,
			Icon:        "/frontend/assets/resources/youth_voice.png",
			ReadTime:    "4 Min Read",
			Content: `
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
`,
			Category:  "Empowerment",
			Language:  "en",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		models.Resource{
			Title:       "ඔබේ හඬ වැදගත්: වැරැද්දට එරෙහිව කතා කරන්න",
			Description: "සිදුවීම් වාර්තා කිරීමට සහ ඔබේ සහජ බුද්ධිය විශ්වාස කිරීමට දරුවන් සවිබල ගැන්වීම. ඔබ කිසිවිටෙක හුදකලා නොවේ.",
			Type:        models.ResourceTypeArticle,
			Icon:        "/frontend/assets/resources/youth_voice.png",
			ReadTime:    "විනාඩි 4 කියවීමක්",
			Content: `
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
`,
			Category:  "Empowerment",
			Language:  "si",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		models.Resource{
			Title:       "Social Media Privacy: Keeping Your Profiles Safe",
			Description: "Easy steps to protect your personal information on social media apps.",
			Type:        models.ResourceTypeArticle,
			Icon:        "/frontend/assets/resources/social_media_privacy.png",
			ReadTime:    "6 Min Read",
			Content: `
## Your Profile, Your Rules

Social media is a fun way to connect, but privacy is key!

### 1. Account Settings
Set your profiles to 'Private' so only friends can see your posts.

### 2. Photo Sharing
Be careful with photos that show your school uniform or your house.

### 3. Unknown Friends
Only accept friend requests from people you actually know in real life.
`,
			Category:  "Digital Privacy",
			Language:  "en",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		models.Resource{
			Title:       "සමාජ මාධ්‍ය පෞද්ගලිකත්වය: ඔබේ ගිණුම් ආරක්ෂිතව තබා ගනිමු",
			Description: "සමාජ මාධ්‍ය යෙදුම්වල ඔබේ පෞද්ගලික තොරතුරු ආරක්ෂා කර ගැනීමට පහසු පියවර.",
			Type:        models.ResourceTypeArticle,
			Icon:        "/frontend/assets/resources/social_media_privacy.png",
			ReadTime:    "විනාඩි 6 කියවීමක්",
			Content: `
## ඔබේ ගිණුම, ඔබේ නීති

සමාජ මාධ්‍ය සම්බන්ධ වීමට විනෝදජනක ක්‍රමයකි, නමුත් පෞද්ගලිකත්වය ඉතා වැදගත්ය!

### 1. ගිණුම් සැකසුම් (Settings)
මිතුරන්ට පමණක් ඔබේ තොරතුරු පෙනෙන පරිදි ඔබේ ගිණුම 'Private' කර ගන්න.

### 2. ඡායාරූප බෙදා ගැනීම
ඔබේ පාසල් නිල ඇඳුම හෝ ඔබේ නිවස පෙනෙන ඡායාරූප පළ කිරීමේදී ප්‍රවේශම් වන්න.

### 3. නොහඳුනන මිතුරන්
ඔබ සැබෑ ජීවිතයේ දන්නා පුද්ගලයින්ගේ මිතුරු ඉල්ලීම් (Friend Requests) පමණක් පිළිගන්න.
`,
			Category:  "Digital Privacy",
			Language:  "si",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		models.Resource{
			Title:       "Helping a Friend: What to Do When Someone is Hurt",
			Description: "How to be a good friend and speak up for those who might be scared.",
			Type:        models.ResourceTypeArticle,
			Icon:        "/frontend/assets/resources/peer_support.png",
			ReadTime:    "5 Min Read",
			Content: `
## Being a Safety Hero

Sometimes a friend might be in trouble but too scared to tell anyone.

### 1. Listen Without Judgment
If a friend tells you something serious, listen carefully and stay calm.

### 2. Don't Keep Harmful Secrets
If a friend is being hurt, you MUST tell a trusted adult, even if they asked you to keep it a secret.

### 3. Encourage Them
Remind your friend that it's not their fault and that help is available.
`,
			Category:  "Peer Support",
			Language:  "en",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		models.Resource{
			Title:       "මිතුරෙකුට උදව් කිරීම: යමෙකුට රිදවන විට ඔබ කුමක් කළ යුතුද?",
			Description: "හොඳ මිතුරෙකු වන්නේ කෙසේද සහ බිය වී සිටින අය වෙනුවෙන් හඬ අවදි කරන්නේ කෙසේද.",
			Type:        models.ResourceTypeArticle,
			Icon:        "/frontend/assets/resources/peer_support.png",
			ReadTime:    "විනාඩි 5 කියවීමක්",
			Content: `
## ආරක්ෂක වීරයෙකු වන්න

සමහර විට මිතුරෙකු කරදරයක සිටියත් එය කිසිවෙකුට පැවසීමට බිය විය හැකිය.

### 1. විනිශ්චය නොකර සවන් දෙන්න
මිතුරෙකු ඔබට බරපතල දෙයක් පැවසුවහොත්, ඉතා හොඳින් සවන් දී සන්සුන්ව සිටින්න්න.

### 2. හානිකර රහස් ආරක්ෂා නොකරන්න
මිතුරෙකුට රිදවන්නේ නම්, ඔවුන් එය රහසක් ලෙස තබා ගැනීමට පැවසුවද, ඔබ අනිවාර්යයෙන්ම විශ්වාසවන්ත වැඩිහිටියෙකුට පැවසිය යුතුය.

### 3. ඔවුන් දිරිමත් කරන්න
එය ඔවුන්ගේ වරදක් නොවන බවත් උපකාර ලබා ගැනීමට හැකි බවත් ඔබේ මිතුරාට මතක් කර දෙන්න.
`,
			Category:  "Peer Support",
			Language:  "si",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		models.Resource{
			Title:       "Safe Travels: Staying Alert on Public Transport",
			Description: "Practical safety tips for when you are traveling by bus or train.",
			Type:        models.ResourceTypeArticle,
			Icon:        "/frontend/assets/resources/travel_safety.png",
			ReadTime:    "4 Min Read",
			Content: `
## Traveling with Confidence

Staying safe while traveling is all about being aware of your surroundings.

### 1. Stay in Well-Lit Areas
Wait for your bus or train in areas where there are other people and plenty of light.

### 2. Trust Your Instincts
If someone on the bus makes you feel uncomfortable, move to a different seat or stand near the driver.

### 3. Keep Someone Informed
Always let a parent or guardian know when you start your journey and when you arrive.
`,
			Category:  "Physical Safety",
			Language:  "en",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		models.Resource{
			Title:       "ආරක්ෂිත ගමන් බිමන්: පොදු ප්‍රවාහනයේදී අවදියෙන් සිටිමු",
			Description: "ඔබ බස් රථයේ හෝ දුම්රියේ ගමන් කරන විට වැදගත් වන ප්‍රායෝගික ආරක්ෂක උපදෙස්.",
			Type:        models.ResourceTypeArticle,
			Icon:        "/frontend/assets/resources/travel_safety.png",
			ReadTime:    "විනාඩි 4 කියවීමක්",
			Content: `
## විශ්වාසයෙන් ගමන් කරමු

ගමන් බිමන් වලදී ආරක්ෂිතව සිටීමට ඔබේ වටපිටාව පිළිබඳව අවදියෙන් සිටීම ඉතා වැදගත් වේ.

### 1. ආලෝකය සහිත ස්ථානවල රැඳී සිටින්න්න
බස් රථය හෝ දුම්රිය එනතුරු වෙනත් අය සිටින සහ හොඳින් ආලෝකය ඇති ස්ථානවල රැඳී සිටින්න්න.

### 2. ඔබේ සහජ බුද්ධිය විශ්වාස කරන්න
ප්‍රවාහන සේවයේ සිටින යමෙකු ඔබව අපහසුවට පත් කරන්නේ නම්, වෙනත් අසූවකට මාරු වන්න හෝ රියදුරු අසලට යන්න.

### 3. දැනුවත් කර තබන්න
ඔබේ ගමන ආරම්භ කරන විට සහ අවසන් කරන විට සැමවිටම දෙමාපියන් හෝ භාරකරුවන් දැනුවත් කරන්න.
`,
			Category:  "Physical Safety",
			Language:  "si",
			CreatedAt: time.Now(),
			UpdatedAt: time.Now(),
		},
		models.Resource{
			Title:       "Mata karadarayak unoth monada karanna ona?",
			Description: "Steps to take during an emergency.",
			Type:        models.ResourceTypeFAQ,
			Icon:        "fa-question-circle",
			ReadTime:    "1 Min",
			Content:     "Speak to a trusted adult immediately, call 1929 (Childline), or use the SOS feature in this app. Your safety is our top priority.",
			Category:    "Emergency",
			Language:    "en",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
		models.Resource{
			Title:       "මට කරදරයක් වුනොත් මොකද කරන්න ඕනේ?",
			Description: "හදිසි අවස්ථාවකදී අනුගමනය කළ යුතු පියවර.",
			Type:        models.ResourceTypeFAQ,
			Icon:        "fa-question-circle",
			ReadTime:    "විනාඩි 1",
			Content:     "වහාම විශ්වාසවන්ත වැඩිහිටියෙකුට පවසන්න, 1929 (ළමා උපකාරක සේවය) අමතන්න, හෝ මෙම යෙදුමේ ඇති SOS පහසුකම භාවිතා කරන්න. ඔබේ ආරක්ෂාව අපගේ ප්‍රමුඛතාවයයි.",
			Category:    "Emergency",
			Language:    "si",
			CreatedAt:   time.Now(),
			UpdatedAt:   time.Now(),
		},
	}

	_, err = collection.InsertMany(ctx, resources)
	if err != nil {
		log.Fatalf("failed to seed resources: %v", err)
	}

	log.Println("✅ Successfully seeded educational resources and FAQs!")
}
