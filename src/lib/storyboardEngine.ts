import type { StoryboardResult, StoryboardScene } from '../types/index.ts';

export interface GenerateStoryboardParams {
  workflowId: string;
  topic: string;
  productName?: string;
  targetAudience?: string;
  duration?: '10s' | '20s' | '30s' | '60s';
  language?: 'Malay' | 'English';
  aspectRatio?: '9:16' | '16:9' | '1:1';
}

export function generateStoryboard(params: GenerateStoryboardParams): StoryboardResult {
  const {
    workflowId = 'storyboard-universal',
    topic,
    productName = topic,
    targetAudience = 'TikTok & Reels Audience in Malaysia & Southeast Asia',
    duration = '10s',
    language = 'Malay',
    aspectRatio = '9:16'
  } = params;

  let sceneCount = 4;
  if (duration === '20s') sceneCount = 8;
  else if (duration === '30s') sceneCount = 12;
  else if (duration === '60s') sceneCount = 24;

  const totalSeconds = parseFloat(duration.replace('s', ''));
  const sceneSeconds = (totalSeconds / sceneCount).toFixed(1);

  const scenes: StoryboardScene[] = [];

  for (let i = 1; i <= sceneCount; i++) {
    const start = ((i - 1) * parseFloat(sceneSeconds)).toFixed(1);
    const end = (i * parseFloat(sceneSeconds)).toFixed(1);
    const timeframe = `${start}s–${end}s`;

    let visual = '';
    let camera = '';
    let emotion = '';
    let dialogue = '';
    let action = '';

    // Specialized Logic per workflow
    if (workflowId === 'storyboard-pov-hand') {
      if (i === 1) {
        visual = `POV first-person shot: Realistic hands reaching into frame to unbox ${productName}. Crisp lighting highlights texture and packaging.`;
        camera = 'POV Close-Up, high angle 45 degrees, subtle hand sway';
        emotion = 'Anticipation & Discovery';
        action = 'Hands carefully peel seal or lift lid, revealing pristine product.';
        dialogue = language === 'Malay'
          ? `Tengok ni bila sampai je kat tangan terus rasa premium gila.`
          : `First impression right out of the box feels extraordinarily premium.`;
      } else if (i === sceneCount) {
        visual = `POV hero demonstration: Hands displaying ${productName} in use with smooth application and glowing finish. Clear CTA graphic overlay.`;
        camera = 'POV Macro to Dutch Angle tilt, steady push-in';
        emotion = 'Pure Satisfaction & Urgency';
        action = 'Hands place product down in center frame beside phone showing link in bio.';
        dialogue = language === 'Malay'
          ? `Kalau korang nak try rasa sendiri, grab sekarang kat beg kuning!`
          : `If you want to experience this yourself, tap the link below now!`;
      } else {
        visual = `POV hands-on test: Hands interacting with key function of ${productName}. Ultra-sharp macro focus on detail.`;
        camera = 'Overhead POV Top-Down Shot, fast rack focus';
        emotion = 'Curiosity & Immersion';
        action = 'Demonstrating how effortless and smooth the interaction is.';
        dialogue = language === 'Malay'
          ? `Bukan kalang-kalang, tekstur dia memang lembut dan serap sepantas kilat.`
          : `Notice how seamlessly it glides and absorbs in just seconds.`;
      }
    } else if (workflowId === 'storyboard-asmr') {
      if (i === 1) {
        visual = `Extreme macro shot of ${productName} with crisp ambient lighting. Sound wave indicator visual effect.`;
        camera = 'Extreme Macro (100mm lens), static with microscopic vibration';
        emotion = 'Sensory Tingles & Calm';
        action = 'Fingernails gently tapping on surface creating rhythmic acoustic trigger.';
        dialogue = language === 'Malay'
          ? `(Whisper / Berbisik) Dengar bunyi tap ni... sedap gila kan?`
          : `(Gentle whisper) Listen to this satisfying tap... chills guaranteed.`;
      } else if (i === sceneCount) {
        visual = `Slow satisfying reveal of ${productName} fully opened, surrounded by soft lighting and acoustic perfection.`;
        camera = 'Slow Motion 120fps Pan Down';
        emotion = 'Ultimate Relaxation';
        action = 'Final slow click / snap closure echoing cleanly in sound design.';
        dialogue = language === 'Malay'
          ? `(Whisper) Nak rasa kepuasan macam ni? Jangan tunggu lagi.`
          : `(Whisper) Craving this exact feeling? Experience it today.`;
      } else {
        visual = `Tactile interaction with ${productName}: peeling plastic, smooth glide, satisfying snap.`;
        camera = 'Close-up side profile shot, tight depth of field';
        emotion = 'Intense Focus & ASMR Tingles';
        action = 'Deliberate, slow-motion mechanical action highlighting sound design.';
        dialogue = language === 'Malay'
          ? `(Soft whisper) Bunyi 'click' ni memang buat tak boleh berhenti dengar.`
          : `(Soft whisper) That click sound hits just the right frequency.`;
      }
    } else if (workflowId === 'storyboard-talking-head') {
      if (i === 1) {
        visual = `Passionate creator / founder looking straight into the camera lens with intense eye contact and expressive hand gestures.`;
        camera = 'Medium Close Up (50mm f/1.8), quick snap zoom into tight shot';
        emotion = 'Urgency, Relatability & Pattern Interrupt';
        action = 'Creator raises eyebrow and points finger directly forward.';
        dialogue = language === 'Malay'
          ? `Ramai orang buat silap besar ni bila cerita pasal ${topic}!`
          : `Most people make this huge mistake when it comes to ${topic}!`;
      } else if (i === sceneCount) {
        visual = `Creator smiles warmly, presenting ${productName} beside them with animated arrow pointing down.`;
        camera = 'Eye-level Medium Shot, confident posture';
        emotion = 'Empowerment & Clear Call to Action';
        action = 'Creator gives enthusiastic nod and points directly to caption/button.';
        dialogue = language === 'Malay'
          ? `Jangan buang masa cuba sendiri, klik link kat profil sekarang.`
          : `Stop trying to reinvent the wheel—tap the link in bio right now.`;
      } else {
        visual = `Split screen or dynamic text kinetic overlay emphasizing the painful obstacle vs smart solution.`;
        camera = 'Slight low angle tracking creator as they move naturally';
        emotion = 'Realization & Authority';
        action = 'Creator gestures counting 1, 2 on fingers with energetic pacing.';
        dialogue = language === 'Malay'
          ? `Benda ni yang bezakan orang yang berjaya dengan yang terus sangkut.`
          : `This exact shift is what separates those who succeed from those stuck.`;
      }
    } else {
      // Universal and other styles
      if (i === 1) {
        visual = `HOOK SCENE: High-energy visual showing the core struggle related to ${topic}. Fast transition into high curiosity.`;
        camera = 'Snap Zoom from Wide to Extreme Close-Up, high impact shake';
        emotion = 'Instant Curiosity & Shock Factor';
        action = 'Subject freezes in moment of dilemma before rapid solution appears.';
        dialogue = language === 'Malay'
          ? `Stop scroll jap! Ramai yang tak perasan rahsia ${productName} ni!`
          : `Hold on! Almost nobody knows this secret about ${productName}!`;
      } else if (i === sceneCount) {
        visual = `CONVERSION SCENE: Flawless beauty/hero shot of ${productName} with vibrant background lighting and dynamic kinetic text overlay.`;
        camera = '360 Orbit or Slow Dolly In with Low Angle Hero Stance';
        emotion = 'Desire, Confidence & Immediate Action';
        action = 'Clear visual CTA displayed with animated glowing button.';
        dialogue = language === 'Malay'
          ? `Korang patut rasa sendiri benda ni. Tekan link kat bawah sebelum habis stock!`
          : `You deserve to experience this. Tap the link below before it sells out!`;
      } else {
        visual = `DEMONSTRATION: Dynamic shot breaking down why ${productName} solves the problem effortlessly.`;
        camera = i % 2 === 0 ? 'Smooth Tracking Shot from Left to Right' : 'Push In Dutch Angle 15 degrees';
        emotion = 'Relief & Fascination';
        action = 'Seamless before-and-after demonstration with split-second payoff.';
        dialogue = language === 'Malay'
          ? `Scene ${i}: Bukan biasa-biasa, tengok macam mana dia ubah result jadi 10 kali ganda lebih pantas!`
          : `Scene ${i}: Look at how smoothly it delivers results 10 times faster than the traditional way!`;
      }
    }

    const ai_image_prompt = `Cinematic ${workflowId.replace('storyboard-', '')} visual frame, scene showing ${action}, featuring ${productName || topic}, professional studio lighting, 8k resolution, photorealistic, film grain, vertical ${aspectRatio} aspect ratio, depth of field --ar ${aspectRatio === '9:16' ? '9:16' : aspectRatio === '16:9' ? '16:9' : '1:1'} --v 6.1 --style raw`;

    const ai_video_prompt = `Cinematic video shot: ${camera}. ${visual} Character/subject action: ${action}. Motion speed: smooth continuous 24fps. Hyper-realistic lighting, consistent style --motion 6`;

    scenes.push({
      scene_number: i,
      timeframe,
      visual,
      camera,
      action,
      emotion,
      dialogue,
      ai_image_prompt,
      ai_video_prompt
    });
  }

  return {
    id: `sb_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    workflow_id: workflowId,
    topic,
    style: workflowId.replace('storyboard-', '').toUpperCase(),
    duration,
    target_audience: targetAudience,
    language,
    product_name: productName,
    aspect_ratio: aspectRatio,
    scenes,
    created_at: new Date().toISOString()
  };
}
