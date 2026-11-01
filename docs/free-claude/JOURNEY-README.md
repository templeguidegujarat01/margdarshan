# Free Claude se Journey Blueprint careers banana (owner guide, Hinglish)

Ek line me: **`emargdarshan.com/journey-next.html` kholo → pehle career ke saamne "Copy" → naye Claude chat me paste →
Send → jo ZIP mile use GitHub par upload → Commit.** 2–5 minute me career ka poora page (Class 8 se job tak) live,
Journey Blueprint search me, site search me. Prompt kabhi badalna nahi, career ka naam bhi type nahi karna: Copy
button sab ek saath copy karta hai.

## Har din ke steps

1. **Daily list kholo**: `https://emargdarshan.com/journey-next.html` (bookmark kar lo; ye page Google me nahi aata,
   menu me bhi nahi hai — sirf aapke liye).
2. Sabse upar wale career ke saamne **Copy** dabao. (Koi aur career chahiye to upar box me naam type karo, uska Copy.)
3. **Naya Claude chat** kholo (koi bhi account, free bhi). **Web search ON** rakho. Model: jo milta hai (Sonnet theek hai).
4. **Paste → Send.** Kuch aur likhne ki zaroorat nahi — prompt + career + list sab copy me aa gaya.
5. Claude research karke ek **ZIP** dega (`journey--<naam>.zip`) aur neeche wahi YAML code block me.
6. **GitHub par upload**: github.com par `margdarshan` repo (main page) → **Add file → Upload files** → ZIP ko seedha
   drag karo (extract karna zaroori nahi; extract kiya to andar ki `.yml` file daalo) → **Commit changes**.
   ZIP na mile to: **Add file → Create new file** → naam `journey--<naam>.yml` (jo Claude ne likha) → code block ka
   text paste → Commit.
7. **Check**: repo → **Actions** → "Journey inbox" green ✔ (1–3 min). Phir `inbox/JOURNEY-REPORT.md` kholo:
   "Published" likha hai to page live: `https://emargdarshan.com/journey-<naam>.html`. Daily list se wo career apne
   aap hat jaata hai, koi tick nahi karna.

Ek account se ek din me jitne ho sake utne karo — har career ek naya chat. Ek chat me ek hi career.

## Claude ko kaise pata ki kya bana hua hai? (aapka sawaal)

Aapko kuch batana nahi padta. **Copy button har baar ye bhi copy karta hai:**
- `already built:` — ab tak bane saare careers ki list (har upload ke baad page khud update hota hai).
- `same-field titles:` — usi field ke 40 titles jo abhi nahi bane.

Isliye har naya Claude account bhi jaanta hai kya bana hai. Agar career kisi bane hue career jaisa hi raasta hai
(jaise "Railway Station Master" jab "railway-ntpc" bana hai), to Claude poora page nahi banata — ek chhoti
**alias** file deta hai (`journey-alias--railway-ntpc.yml`). Upload karne par wo naam search me us page par le jaata
hai. Upload waise hi karna hai.

Aur jab Claude naya page banata hai, wo `also_titles` me usi raste wale doosre titles bhi daal deta hai (jaise
"Heritage Tour Guide" ke saath "Temple Heritage Guide") — wo sab bhi list se hat jaate hain aur search me aate hain.
Isse 10,000 naam bina 10,000 copy-paste pages ke search me aa jaate hain.

## Page me kya hota hai (77 jaisa, state wala hissa nahi)

Job kya hai, normal din, pay (sirf official), main routes, time aur fees, mushkil hisse, kise nahi lena chahiye →
**Class 8, 9, 10, 11, 12, college, graduate, working/switching** — har stage pe kya karna, kaunsa stream, kaunsa exam,
galtiyan, "late ho gaye to?" aur 15–24 student doubts (Google FAQ ke saath) → main exam ki table → aage ke careers →
scholarship/fee help → sources. Student apni class chunta hai to page wahin se shuru hota hai. **State-by-state
rules nahi** — sirf national road (jaisa aapne kaha).

Keywords: `search` (blueprint search ke chhote phrases), `keywords` (Hindi/Hinglish naam, course, exam, "how to
become", "after 12th") — dono site search me jaate hain. Page ka Google title "How to Become a … : Class 8 to Career
Road" apne aap banta hai (60 character limit ke andar).

## Robot kya check karta hai

- Career ka naam 10,000 wali list me hona chahiye, aur pehle se bana nahi hona chahiye.
- Har source link kholta hai: domain hi nahi hai ya page 404 → **poori file reject** (nakli link site par kabhi nahi
  jaata). Jo site robots ko rokti hai (403, timeout) wo rakhi jaati hai, report me "open them once yourself".
- HTML hata deta hai, state rows hata deta hai, galat page links hata deta hai, "guide" / "engineer" jaise bahut
  chaude ek-shabd search phrase hata deta hai, bina use wale sources hata deta hai.
- Wahi checker chalata hai jo 77 careers par chalta hai: Class 8 → graduate sab stages, 15+ doubts, har pay/fee/exam
  line ke saath source. Ek bhi galti → file reject, site jaisi thi waisi.
- Reject hone par: `inbox/JOURNEY-REPORT.md` me reason. Wo reason + file (inbox/rejected/ me) **usi Claude chat me**
  do aur bolo "fix only this and give the file again" → nayi file upload.
- **Robot facts check nahi kar sakta** (link asli hai par number galat ho sakta hai). Kabhi-kabhi ek page kholo,
  2–3 numbers ke saamne wala source khol ke dekh lo.

## Galti ho jaaye to — Undo

Repo → **Actions** → left me **Journey undo** → **Run workflow** → box me career id (jaise `heritage-tour-guide`,
REPORT ya `docs/free-claude/JOURNEY-LOG.md` me dikhta hai) ya alias upload ka naam (`journey-alias--railway-ntpc`) →
**Run workflow**. 2–5 min me page, search, list sab pehle jaisa. Pehle ke 77 hand-built careers undo se kabhi nahi
hatte.

## Files (Pro aaye to Claude Code ke liye)

| Kya | Kahan |
|---|---|
| Prompt (ek hi jagah) | `_includes/journey-prompt.txt` → daily list page isi ko copy karta hai |
| Daily list | `journey-next.html` (noindex, sitemap me nahi) |
| Robot | `scripts/journey-ingest.mjs`, workflow `.github/workflows/journey-inbox.yml` |
| Undo | `scripts/journey-undo.mjs`, workflow `.github/workflows/journey-undo.yml` |
| Career data | `_data/in/journey/<id>.yml` (`inbox:` field = free-Claude se aaya) |
| Site search entries | `_data/in/journey_search.yml` (build-journey-pages.mjs banata hai) |
| Report / log | `inbox/JOURNEY-REPORT.md`, `docs/free-claude/JOURNEY-LOG.md` |

State-wise "kahan seekhein" (college/coaching) wala kaam alag hai: `docs/free-claude/README.md`.
