### 一。 git核心概念
 #### 1. * GIT是一个**分布式**版本控制系统。每个开发者的本地都有一个完整的仓库历史，支持离线操作。
 #### 2. 四大工作区域
|区域|作用|常用命令|
|:--:|:--:|:--:|
|工作区 (Workspace)|本地文件系统可见的目录，日常编辑的位置|git status|
|暂存区 (Stage/Index)|临时存放改动，保存即将提交的文件列表信息|git add|
|本地仓库 (Repository)|存储完整的提交历史，HEAD 指向最新放入仓库的版本|git commit|
|远程仓库 (Remote)|云端共享仓库（如 GitHub/GitLab/Gitee），用于远程数据交换|git push、git pull|
### 二。 初始配置与仓库管理
#### 1. 配置用户信息
* (主要用来提交记录，跟账号关系不大， 账号跟远程仓库有关)
```
# 全局配置（所有项目生效）
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"


# 仅当前项目配置（优先级更高）
git config user.name "Project Name"
```
### 三. Git 常用用法
#### 1. 初始化仓库
```
git init                    # 初始化一个新的本地 Git 仓库
git clone <url>             # 克隆远程仓库到本地（如：git clone https://github.com/user/repo.git）
git clone <url> --depth=1   # 浅克隆（仅拉取最近一次提交，加快速度）

```
> 💡 **提示：** `git clone` 会自动创建指向远程仓库的默认**别名** `origin`。
#### 2. 添加与提交
* `git add`: 添加到暂存区； `git commit`: 提交到本地仓库
```
git add <file>              # 将指定文件添加到暂存区
git add .                   # 添加当前目录所有变更（包括新文件和修改）
git add -u                  # 只添加已被跟踪的修改/删除文件（不包括新文件）
git add -A                  # 添加所有变更（等同于 git add . + git add -u）

git commit -m "描述性信息"   # 提交到本地仓库，-m 后接提交说明
```
#### 3.推送与拉取
```
git push origin main        # 推送本地 main 分支到远程 origin
git push -u origin feature/login  # 第一次推送时设置上游分支（后续可用 git push 直接推送）

git pull origin main        # 拉取远程更新并自动合并（等价于 git fetch + git merge）
git fetch                   # 获取远程更新但不合并，可先查看差异再决定是否合并

```
> 💡 **提示：** `git pull` 可能触发自动合并，若存在冲突需手动解。

#### 4.分支操作
```
git branch                  # 列出所有本地分支（* 表示当前分支）
git branch <name>           # 创建新分支
git checkout <name>         # 切换到指定分支
git switch <name>           # Git 2.23+ 推荐的新命令，语义更清晰

git checkout -b <name>      # 创建并切换到新分支（等价于 git branch + git switch）
git merge <branch>          # 将指定分支合并到当前分支
git branch -d <name>        # 删除已合并的本地分支（-D 强制删除未合并分支）
```
#### 5. 远程仓库（Remote）
```
git remote add origin <url>  #添加远程别名
git push origin main         #推送本地提交到远程
git pull origin main.        #拉取远程更新并合并（实际是 fetch + merge）

```

### 四. Git 高级用法
#### 1. 合并(Merge)
* 将一个分支的修改整合到当前分支
```
git merge <source-branch>
```
> 💡 **提示：** 若冲突则需手动解决。
#### 2. 变基（Rebase）
* 将一系列提交“重新播放”到另一个目标提交之上（最新提交记录的后面）;
* 使历史记录变为线性;
* 整理提交历史，避免无意义的合并提交；让分支看起来更整洁;
```
git checkout feature
git rebase main              # 将 feature 分支的提交移动到 main 的最新提交的**后面**
```
> 💡 **提示：** 永远不要在公共分支上使用；已推送的提交若被 rebase，会导致协作混乱。

> 🛠️ **推荐场景：** 在功能分支开发完成后，**合并前使用** `git rebase main` 同步最新代码。
#### 3. 重置（Reset）
* 撤销提交、取消暂存、丢弃修改等
* 适合场景：本地提交有误，且**还没有**推送到远程时使用
```
git reset --soft HEAD~1               #撤销提交，但保留修改在暂存区 (即回到提交之前的暂存区)
git reset --mixed HEAD~1（默认）       #撤销提交，保留修改在工作区 (即回到add添加到暂存区之前)
git reset --hard HEAD~1               #完全丢弃最近一次提交及其修改（危险！）(即放弃修改，回到修改之前)
```
> 💡 **提示：**  --hard 彻底删除提交和修改，无法轻易恢复。
#### 4. 回滚（git revert）
* 创建一个新的提交，用于撤销某次历史提交的更改
* 历史记录保持不变，是安全的撤销方式
* 适合场景：已经推送到远程仓库的提交，或者需要保留完整协作历史的场景
```
git revert <commit-hash>   # 撤销指定提交
git revert HEAD~1          # 撤销倒数第二个提交
```
#### 5. 储藏（Stashing）
* 临时保存工作进度
* 使用场景：
  * 1. 正在开发中，需要切换分支处理紧急 bug
  * 2. 临时保存未完成代码，拉取最新代码后再恢复
```
git stash                   # 临时保存工作区和暂存区的修改
git stash save "描述信息"    # 添加备注（推荐做法）

git stash list              # 查看所有储藏
git stash pop               # 恢复最近一次储藏并删除
git stash apply             # 恢复储藏但保留记录
git stash drop stash@{
   0}    # 删除指定储藏
git stash clear             # 清空所有储藏
```