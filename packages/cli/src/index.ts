#!/usr/bin/env node
import { Command } from 'commander';
import { scanSite } from '@prasadkumbhar/webscan-core';
import { Agent } from '@prasadkumbhar/webscan-agent';
import { generateHtmlReport } from './html-report';
import * as fs from 'fs';
import * as path from 'path';
import chalk from 'chalk';
import Table from 'cli-table3';
import ora from 'ora';
import 'dotenv/config';

const program = new Command();

program
  .name('webscan')
  .description('Lightweight website auditing tool')
  .version('0.1.0');

program
  .command('scan')
  .description('Scan one or more URLs')
  .argument('<urls...>', 'URLs to scan')
  .option('--out <path>', 'Output file or directory (for batch mode)')
  .option('--json', 'Output report as JSON')
  .option('--deep', 'Deep scan flag (currently placeholder)')
  .action(async (urls: string[], options) => {
    const isBatch = urls.length > 1;
    const outPath = options.out;

    if (isBatch && outPath) {
      if (!fs.existsSync(outPath) || !fs.statSync(outPath).isDirectory()) {
        fs.mkdirSync(outPath, { recursive: true });
      }
    }

    const agent = new Agent();

    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      let formattedUrl = url;
      if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
        formattedUrl = 'https://' + formattedUrl;
      }

      console.log(chalk.bold.blue(`\nScanning [${i + 1}/${urls.length}]: ${formattedUrl}`));
      
      const spinner = ora('Running core scan engine...').start();
      try {
        const report = await scanSite(formattedUrl);
        spinner.text = 'Running Agent synthesis...';
        const synthesized = await agent.synthesize(report);
        spinner.succeed('Scan complete');

        // Print to terminal
        console.log('\n' + chalk.bold('Agent Summary:'));
        console.log(chalk.gray(synthesized.summary) + '\n');

        const table = new Table({
          head: ['Category', 'Score'],
          colWidths: [30, 10]
        });
        
        table.push(['Overall', getColor(synthesized.overallScore)(synthesized.overallScore)]);
        
        synthesized.categories.forEach(cat => {
          table.push([cat.name, getColor(cat.score)(cat.score)]);
        });
        console.log(table.toString());

        const totalFixes = synthesized.categories.reduce((acc, cat) => acc + cat.toFix.length, 0);
        if (totalFixes > 0) {
          console.log('\n' + chalk.bold('Issues Found:'));
          synthesized.categories.forEach(cat => {
            if (cat.toFix.length > 0) {
              console.log(chalk.bold(`\n${cat.name}:`));
              cat.toFix.forEach(fix => {
                const color = fix.severity === 'high' ? chalk.red : fix.severity === 'medium' ? chalk.yellow : chalk.blue;
                console.log(`- ${color(`[${fix.severity.toUpperCase()}]`)} ${fix.description}`);
              });
            }
          });
        }

        // Output file
        if (outPath) {
          const finalPath = isBatch 
            ? path.join(outPath, `report-${new URL(formattedUrl).hostname}-${Date.now()}.${options.json ? 'json' : 'html'}`)
            : outPath;
            
          if (options.json) {
            fs.writeFileSync(finalPath, JSON.stringify(synthesized, null, 2));
            console.log(chalk.green(`\nSaved JSON report to ${finalPath}`));
          } else {
            fs.writeFileSync(finalPath, generateHtmlReport(synthesized));
            console.log(chalk.green(`\nSaved HTML report to ${finalPath}`));
          }
        }
      } catch (err: any) {
        spinner.fail(`Scan failed for ${formattedUrl}`);
        console.error(chalk.red(err.message));
      }
    }
  });

function getColor(score: number) {
  if (score >= 90) return chalk.green;
  if (score >= 50) return chalk.yellow;
  return chalk.red;
}

program.parse(process.argv);
