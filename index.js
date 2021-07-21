#!/usr/bin/env node
//让使用 node 进行脚本的解释程序
// 设计命令行 
const program = require('commander');
// git仓库下载
const download = require('download-git-repo');
//命令行答询
const inquirer = require('inquirer');
//修改字符
const handlebars = require('handlebars');
//命令行中加载状态标识
const ora = require('ora');
// 命令行输出字符颜色
const chalk = require('chalk');
//命令行输出符号
const logSymbols = require('log-symbols');

const fs = require('fs');
const request = require('request');
const {resolve} = require('path');

const install = require("./utils/install");

console.log(chalk.green(`
                           loveivy cli 命令
    ------------------------------------------------------------
        loveivy init <template name> projectName  |  初始化项目 
        loveivy -v                                |  查看版本号    
        loveivy -h                                |  查看帮助      
        loveivy list                              |  查看模板列表  
        loveivy download                          |  下载zip模板  
    ------------------------------------------------------------
`));
// 可用模版
const templates = {
  'custom-react-ivy': {
      url: 'https://github.com/CuteCodevx/custom-react',
      downloadUrl: 'direct:https://github.com/CuteCodevx/custom-react.git#main',
      description: 'react自己实现的先试试看看升级了模版变了没'
  },
};

program.version('1.0.0');

// 创建的指令为loveivy init XX
program.command('init <template> <project>').description('初始化项目模版哈哈哈').action((templateName, projectName)=>{
  //执行的文件
  console.log(templateName, templates);
  let downloadUrl = templates[templateName].downloadUrl;

  //下载github项目，下载墙loading提示
  const spinner = ora('正在下载模板哦...').start();
  console.log(downloadUrl);
  download(downloadUrl, projectName, {clone: true}, err => {
    if (err) {
      console.log(logSymbols.error, chalk.red('项目模板下载失败啦\n   只能下载list列表中有的模板'));
      console.log(err);
      spinner.warn('T_T 失败了呜呜呜')
    } else {
      spinner.succeed('项目模版下载成功了呢');
      //命令行答询
      inquirer.prompt([
        {
          type: 'input',
          name: 'name',
          message: '请输入项目名称',
          default: projectName
        },
        {
            type: 'input',
            name: 'description',
            message: '请输入项目简介',
            default: ''
        },
        {
            type: 'input',
            name: 'author',
            message: '请输入作者名称',
            default: ''
        }
      ]).then(answers => {
        // 根据结果修改package.json文件
        let packageContent = fs.readFileSync(`${projectName}/package.json`, 'utf8');

        let packageResult = handlebars.compile(packageContent)(answers);

        fs.writeFileSync(`${projectName}/package.json`,packageResult);
        console.log(packageResult)
        fs.writeFileSync(`${projectName}/config.js`,`module.exports = ${JSON.stringify(answers)}`);

        console.log(logSymbols.success, chalk.green('项目初始化成功啦，开始下载依赖咯...'));

        install({cwd:`${resolve('./')}/${projectName}`}).then(data => {
          console.log(logSymbols.success, chalk.green('项目下载依赖成功啦！！'));
        });

      })
    }
  })

});

program.command('download').description('初始化项目模板').action((templateName, projectName) => {
        inquirer.prompt([
            {
                type: 'input',
                name: 'project_name',
                message: '请输入项目名称',
                default: 'ivy-react-custom'
            },
            {
                type: 'list',
                name: 'template_name',
                message: '请选择需要下载的模板',
                choices: [
                    'custom-react-ivy',
                ],
                default: 'custom-react-ivy'
            }
        ]).then(answers => {
            let url = ''
            switch (answers.template_name) {
                case 'custom-react-ivy':
                    url = templates['custom-react-ivy'].url;
                    break;
                default:
                    url = templates['custom-react-ivy'].url;
            }
            function downloadFile(uri, fileName, callback) {
                var stream = fs.createWriteStream(fileName);
                request(uri).pipe(stream).on('close', callback);
            }
            downloadFile(url, `${answers.project_name}.zip`, function () {
                console.log(logSymbols.success, chalk.green(`${answers.template_name}下载完毕！`));
                return
            });
        })
    });
    
program.command('list').description('查看所有可用模板').action(() => {
    console.log(chalk.green(`
                          ivy 模板
        -----------------------------------------------
              custom-react-ivy   自己建的项目奥xixi 
        -----------------------------------------------
    `))
});

program.parse(process.argv)