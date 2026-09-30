import { RB_WORKFLOWS } from './storyboardWorkflows.ts';

// Deliberately authored public output requirements, never derived from SKILL.md.
export function creativeBrief(args: {workflow_id:string; topic:string; duration:string; language:string; aspect_ratio:string; target_audience:string; product_name?:string}) {
  const workflow = RB_WORKFLOWS.find(item=>item.id===args.workflow_id);
  if (!workflow) throw new Error('Unknown workflow');
  return {
    topic:args.topic, product:args.product_name, audience:args.target_audience,
    duration:args.duration, language:args.language, aspect_ratio:args.aspect_ratio,
    style:{name:workflow.name,description:workflow.description},
    deliverable:workflow.category === 'storyboard' || args.workflow_id.startsWith('storyboard-') || args.workflow_id==='cartoon-storyboard'
      ? {type:'storyboard',scene_count:Math.round(parseInt(args.duration)/2.5),fields:['timeframe','visual','camera','action','dialogue','sound'],review:'Ask for approval before writing video prompts or creating images.'}
      : {type:'visual concept',fields:['concept','composition','lighting','image prompt'],review:'Ask for approval before creating images.'},
  };
}
