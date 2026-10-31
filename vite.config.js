import { defineConfig } from 'vite';
import { resolve, extname } from 'node:path';
import { readFileSync } from 'node:fs';
const pages = ['index','products','tools','apps','bundles','resources','about','faq','contact','privacy','terms','workspace','projects','big-decision-calculator','rental-property-analyzer','house-flip-profit-calculator','online-store-pricing-calculator'];
const downloads = ['free-weekly-focus-planner.html','90-day-goal-system.html','small-business-launch-kit.html','content-calendar.csv','business-budget.csv','habit-tracker.csv','project-planner.csv','reading-journal.csv','invoice-template.csv','creator-script-planner.csv','subscription-audit.csv','meeting-notes.md','product-launch-checklist.md','savings-goal.csv','study-schedule.csv','client-crm.csv','weekly-review.md','expense-tracker.csv'];
export default defineConfig({
  base: '/digital-product-store/',
  plugins: [{name:'northstar-flat-downloads',generateBundle(){for(const file of downloads){this.emitFile({type:'asset',fileName:file,source:readFileSync(resolve(process.cwd(),file))});}}}],
  build:{rollupOptions:{input:Object.fromEntries(pages.map(page=>[page,resolve(process.cwd(),`${page}.html`)]))}}
});
