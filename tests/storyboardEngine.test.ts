import { describe, it } from 'node:test';
import assert from 'node:assert';
import { RB_WORKFLOWS } from '../src/lib/storyboardWorkflows.ts';
import { generateStoryboard } from '../src/lib/storyboardEngine.ts';

describe('RB Digital Storyboard Engine', () => {
  it('should have all 19 specialized workflows registered', () => {
    assert.strictEqual(RB_WORKFLOWS.length, 19);
    const ids = RB_WORKFLOWS.map(w => w.id);
    assert.ok(ids.includes('storyboard-universal'));
    assert.ok(ids.includes('storyboard-pov-hand'));
    assert.ok(ids.includes('storyboard-asmr'));
    assert.ok(ids.includes('storyboard-talking-head'));
    assert.ok(ids.includes('thumbnail'));
  });

  it('should calculate correct scene counts according to duration rules', () => {
    // 10s = 4 scenes
    const res10 = generateStoryboard({
      workflowId: 'storyboard-universal',
      topic: 'Kopi Pra-campuran',
      duration: '10s'
    });
    assert.strictEqual(res10.scenes.length, 4);

    // 20s = 8 scenes
    const res20 = generateStoryboard({
      workflowId: 'storyboard-pov-hand',
      topic: 'Serum Kulit Emas',
      duration: '20s'
    });
    assert.strictEqual(res20.scenes.length, 8);

    // 30s = 12 scenes
    const res30 = generateStoryboard({
      workflowId: 'storyboard-talking-head',
      topic: 'Bisnes Automasi',
      duration: '30s'
    });
    assert.strictEqual(res30.scenes.length, 12);
  });

  it('should generate valid camera, action, and dialogue fields for every scene', () => {
    const res = generateStoryboard({
      workflowId: 'storyboard-asmr',
      topic: 'Unboxing Earphones',
      duration: '10s',
      language: 'Malay'
    });

    for (const scene of res.scenes) {
      assert.ok(scene.timeframe.length > 0);
      assert.ok(scene.visual.length > 0);
      assert.ok(scene.camera.length > 0);
      assert.ok(scene.action.length > 0);
      assert.ok(scene.emotion.length > 0);
      assert.ok(scene.dialogue.length > 0);
      assert.ok(scene.ai_image_prompt.includes('--ar'));
      assert.ok(scene.ai_video_prompt);
    }
  });

  it('should support English dialogue generation', () => {
    const res = generateStoryboard({
      workflowId: 'storyboard-universal',
      topic: 'Smart Water Bottle',
      duration: '10s',
      language: 'English'
    });

    assert.strictEqual(res.language, 'English');
    assert.ok(res.scenes[0].dialogue.length > 0);
  });
});
