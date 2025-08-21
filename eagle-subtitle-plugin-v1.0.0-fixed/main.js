/**
 * Eagle 字幕插件主文件
 * 符合 Eagle 官方插件架构标准
 */

class EagleSubtitlePlugin {
    constructor() {
        this.currentVideo = null;
        this.currentSubtitles = [];
        this.subtitleWindow = null;
        this.timeOffset = 0;
        this.subtitlesVisible = true;
        
        this.init();
    }
    
    async init() {
        console.log('🎬 Eagle 字幕插件启动中...');
        
        // Eagle 插件初始化
        eagle.onPluginCreate((plugin) => {
            console.log('✅ Eagle 字幕插件已初始化');
            this.setupEventListeners();
        });
    }
    
    setupEventListeners() {
        // 监听文件选择变化
        eagle.onPluginRun(() => {
            console.log('📁 检测到文件选择变化');
            this.handleFileSelection();
        });
        
        // 监听资源库切换
        eagle.onLibraryChanged((libraryPath) => {
            console.log('📚 资源库切换:', libraryPath);
            this.resetPlugin();
        });
        
        // 监听播放器事件
        this.setupPlayerEvents();
    }
    
    setupPlayerEvents() {
        if (!eagle.player) return;
        
        // 播放事件
        if (eagle.player.onPlay) {
            eagle.player.onPlay(() => {
                console.log('▶️ 视频开始播放');
                this.startSubtitleSync();
            });
        }
        
        // 暂停事件
        if (eagle.player.onPause) {
            eagle.player.onPause(() => {
                console.log('⏸️ 视频暂停');
                this.stopSubtitleSync();
            });
        }
        
        // 时间更新事件
        if (eagle.player.onTimeUpdate) {
            eagle.player.onTimeUpdate((time) => {
                this.updateSubtitleDisplay(time + this.timeOffset);
            });
        }
        
        // 结束事件
        if (eagle.player.onEnded) {
            eagle.player.onEnded(() => {
                console.log('🏁 视频播放结束');
                this.stopSubtitleSync();
                this.hideSubtitle();
            });
        }
    }
    
    async handleFileSelection() {
        try {
            const selectedItems = await eagle.item.getSelected();
            if (selectedItems.length === 0) {
                console.log('❌ 没有选中的文件');
                return;
            }
            
            const item = selectedItems[0];
            const videoExtensions = ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v', '3gp'];
            
            if (!videoExtensions.some(ext => item.name.toLowerCase().endsWith(`.${ext}`))) {
                console.log('❌ 选中的不是视频文件:', item.name);
                return;
            }
            
            console.log('🎥 检测到视频文件:', item.name);
            this.currentVideo = item;
            
            // 加载字幕
            await this.loadSubtitles();
            
            // 创建字幕窗口
            await this.createSubtitleWindow();
            
        } catch (error) {
            console.error('❌ 处理文件选择失败:', error);
        }
    }
    
    async loadSubtitles() {
        try {
            console.log('🔍 正在查找字幕文件...');
            
            // 获取视频文件路径
            const videoPath = await this.getVideoPath();
            if (!videoPath) {
                console.log('❌ 无法获取视频文件路径');
                return;
            }
            
            console.log('📹 视频文件路径:', videoPath);
            
            // 查找字幕文件
            const subtitlePath = this.findSubtitleFile(videoPath);
            if (!subtitlePath) {
                console.log('❌ 未找到字幕文件');
                this.showNotification('未找到字幕文件');
                return;
            }
            
            console.log('📝 字幕文件路径:', subtitlePath);
            
            // 读取字幕文件
            const content = await this.readFile(subtitlePath);
            if (!content) {
                console.log('❌ 无法读取字幕文件');
                this.showNotification('无法读取字幕文件');
                return;
            }
            
            // 解析字幕
            const fileExt = subtitlePath.split('.').pop().toLowerCase();
            this.currentSubtitles = this.parseSubtitles(content, fileExt);
            
            if (this.currentSubtitles.length === 0) {
                console.log('❌ 字幕解析失败');
                this.showNotification('字幕解析失败');
                return;
            }
            
            console.log(`✅ 成功加载 ${this.currentSubtitles.length} 条字幕`);
            this.showNotification(`已加载 ${this.currentSubtitles.length} 条字幕`);
            
        } catch (error) {
            console.error('❌ 加载字幕失败:', error);
            this.showNotification('加载字幕失败');
        }
    }
    
    async getVideoPath() {
        try {
            const libraryPath = eagle.library.path;
            console.log('📚 资源库路径:', libraryPath);
            
            // Eagle 可能的文件存储路径
            const possiblePaths = [
                `${libraryPath}/images/${this.currentVideo.id}${this.currentVideo.ext}`,
                `${libraryPath}/images/${this.currentVideo.id}/${this.currentVideo.name}`,
                `${libraryPath}/${this.currentVideo.id}${this.currentVideo.ext}`,
                `${libraryPath}/assets/${this.currentVideo.id}${this.currentVideo.ext}`
            ];
            
            for (const path of possiblePaths) {
                if (await this.fileExists(path)) {
                    return path;
                }
            }
            
            console.log('❌ 在所有可能路径中均未找到视频文件');
            return null;
            
        } catch (error) {
            console.error('❌ 获取视频路径失败:', error);
            return null;
        }
    }
    
    findSubtitleFile(videoPath) {
        const path = require('path');
        const videoDir = path.dirname(videoPath);
        const videoName = path.basename(videoPath, path.extname(videoPath));
        
        // 支持的字幕格式
        const extensions = ['srt', 'ass', 'ssa', 'vtt'];
        
        for (const ext of extensions) {
            const subtitlePath = path.join(videoDir, `${videoName}.${ext}`);
            if (this.fileExistsSync(subtitlePath)) {
                return subtitlePath;
            }
        }
        
        return null;
    }
    
    async fileExists(filePath) {
        try {
            const fs = require('fs');
            return fs.existsSync(filePath);
        } catch (error) {
            return false;
        }
    }
    
    fileExistsSync(filePath) {
        try {
            const fs = require('fs');
            return fs.existsSync(filePath);
        } catch (error) {
            return false;
        }
    }
    
    async readFile(filePath) {
        try {
            const fs = require('fs');
            return fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            console.error('❌ 读取文件失败:', error);
            return null;
        }
    }
    
    parseSubtitles(content, format) {
        const parser = new SubtitleParser();
        return parser.parse(content, format);
    }
    
    async createSubtitleWindow() {
        try {
            // 如果已存在字幕窗口，先关闭
            if (this.subtitleWindow) {
                await this.subtitleWindow.close();
                this.subtitleWindow = null;
            }
            
            console.log('🪟 正在创建字幕窗口...');
            
            // 使用 Eagle 的窗口 API 创建字幕窗口
            this.subtitleWindow = await eagle.window.create({
                title: '字幕显示',
                width: 800,
                height: 600,
                transparent: true,
                frame: false,
                alwaysOnTop: true,
                skipTaskbar: true,
                resizable: false,
                movable: false,
                focusable: false,
                webPreferences: {
                    nodeIntegration: true,
                    contextIsolation: false
                }
            });
            
            // 加载字幕显示页面
            await this.subtitleWindow.loadFile('subtitle.html');
            
            // 设置窗口位置
            await this.positionSubtitleWindow();
            
            console.log('✅ 字幕窗口创建成功');
            
        } catch (error) {
            console.error('❌ 创建字幕窗口失败:', error);
            this.showNotification('创建字幕窗口失败');
        }
    }
    
    async positionSubtitleWindow() {
        try {
            if (!this.subtitleWindow) return;
            
            // 获取 Eagle 主窗口
            const mainWindow = await this.getEagleMainWindow();
            if (mainWindow) {
                const bounds = mainWindow.getBounds();
                this.subtitleWindow.setBounds(bounds);
                console.log('📍 字幕窗口已定位到 Eagle 主窗口');
            } else {
                // 如果无法获取 Eagle 窗口，使用屏幕中央
                const { screen } = require('electron');
                const primaryDisplay = screen.getPrimaryDisplay();
                const { width, height } = primaryDisplay.workAreaSize;
                
                this.subtitleWindow.setBounds({
                    x: 0,
                    y: 0,
                    width: width,
                    height: height
                });
                
                console.log('📍 字幕窗口已定位到全屏');
            }
            
        } catch (error) {
            console.error('❌ 设置字幕窗口位置失败:', error);
        }
    }
    
    async getEagleMainWindow() {
        try {
            if (eagle.window && eagle.window.getMainWindow) {
                return await eagle.window.getMainWindow();
            }
            
            // 备用方法
            const { BrowserWindow } = require('electron');
            const windows = BrowserWindow.getAllWindows();
            
            return windows.find(window => {
                const title = window.getTitle();
                return title.includes('Eagle') && !title.includes('字幕');
            });
            
        } catch (error) {
            console.error('❌ 获取 Eagle 主窗口失败:', error);
            return null;
        }
    }
    
    startSubtitleSync() {
        console.log('▶️ 字幕同步已开始');
        // 开始字幕同步逻辑
    }
    
    stopSubtitleSync() {
        console.log('⏸️ 字幕同步已停止');
        // 停止字幕同步逻辑
    }
    
    updateSubtitleDisplay(currentTime) {
        if (!this.subtitleWindow || !this.subtitlesVisible) {
            return;
        }
        
        try {
            // 查找当前时间对应的字幕
            const subtitle = this.findSubtitleForTime(currentTime);
            
            // 发送到字幕窗口显示
            this.subtitleWindow.webContents.send('subtitle-update', {
                text: subtitle ? subtitle.text : '',
                visible: !!subtitle,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.error('❌ 更新字幕显示失败:', error);
        }
    }
    
    findSubtitleForTime(time) {
        if (this.currentSubtitles.length === 0) {
            return null;
        }
        
        // 使用二分查找提高性能
        let left = 0;
        let right = this.currentSubtitles.length - 1;
        
        while (left <= right) {
            const mid = Math.floor((left + right) / 2);
            const subtitle = this.currentSubtitles[mid];
            
            if (time >= subtitle.startTime && time <= subtitle.endTime) {
                return subtitle;
            } else if (time < subtitle.startTime) {
                right = mid - 1;
            } else {
                left = mid + 1;
            }
        }
        
        return null;
    }
    
    hideSubtitle() {
        if (this.subtitleWindow) {
            try {
                this.subtitleWindow.webContents.send('subtitle-update', {
                    text: '',
                    visible: false,
                    timestamp: Date.now()
                });
            } catch (error) {
                console.error('❌ 隐藏字幕失败:', error);
            }
        }
    }
    
    showNotification(message) {
        console.log('📢', message);
        
        if (this.subtitleWindow) {
            try {
                this.subtitleWindow.webContents.send('notification', message);
            } catch (error) {
                console.error('❌ 发送通知失败:', error);
            }
        }
    }
    
    async resetPlugin() {
        console.log('🔄 重置插件...');
        
        // 关闭字幕窗口
        if (this.subtitleWindow) {
            await this.subtitleWindow.close();
            this.subtitleWindow = null;
        }
        
        // 重置状态
        this.currentVideo = null;
        this.currentSubtitles = [];
        this.timeOffset = 0;
        
        console.log('✅ 插件已重置');
    }
}

// 字幕解析器类
class SubtitleParser {
    parse(content, format) {
        if (!content || !format) {
            throw new Error('字幕内容和格式不能为空');
        }
        
        switch (format.toLowerCase()) {
            case 'srt':
                return this.parseSRT(content);
            case 'ass':
            case 'ssa':
                return this.parseASS(content);
            case 'vtt':
                return this.parseVTT(content);
            default:
                throw new Error(`不支持的字幕格式: ${format}`);
        }
    }
    
    parseSRT(content) {
        const lines = content.split('\n');
        const subtitles = [];
        let currentSubtitle = null;
        let lineIndex = 0;
        
        while (lineIndex < lines.length) {
            const line = lines[lineIndex].trim();
            
            if (line && !isNaN(line)) {
                // 序号行
                if (currentSubtitle) {
                    subtitles.push(currentSubtitle);
                }
                
                currentSubtitle = {
                    index: parseInt(line),
                    startTime: 0,
                    endTime: 0,
                    text: ''
                };
                
                // 下一行是时间轴
                lineIndex++;
                const timeLine = lines[lineIndex].trim();
                const timeMatch = timeLine.match(/(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/);
                
                if (timeMatch) {
                    currentSubtitle.startTime = this.parseSRTTime(timeMatch[1]);
                    currentSubtitle.endTime = this.parseSRTTime(timeMatch[2]);
                }
                
                lineIndex++;
                
                // 读取字幕文本
                while (lineIndex < lines.length && lines[lineIndex].trim() !== '') {
                    currentSubtitle.text += lines[lineIndex] + '\n';
                    lineIndex++;
                }
                
                currentSubtitle.text = currentSubtitle.text.trim();
            }
            
            lineIndex++;
        }
        
        if (currentSubtitle) {
            subtitles.push(currentSubtitle);
        }
        
        return subtitles;
    }
    
    parseSRTTime(timeStr) {
        const match = timeStr.match(/(\d{2}):(\d{2}):(\d{2}),(\d{3})/);
        if (match) {
            const hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const seconds = parseInt(match[3]);
            const milliseconds = parseInt(match[4]);
            
            return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
        }
        return 0;
    }
    
    parseASS(content) {
        const lines = content.split('\n');
        const subtitles = [];
        let inEventsSection = false;
        
        for (const line of lines) {
            const trimmedLine = line.trim();
            
            if (trimmedLine === '[Events]') {
                inEventsSection = true;
                continue;
            }
            
            if (inEventsSection && trimmedLine.startsWith('Dialogue:')) {
                const dialogue = this.parseASSDialogue(trimmedLine);
                if (dialogue) {
                    subtitles.push(dialogue);
                }
            }
        }
        
        return subtitles;
    }
    
    parseASSDialogue(line) {
        const dialogueContent = line.substring(9);
        const parts = dialogueContent.split(',');
        
        if (parts.length >= 10) {
            return {
                startTime: this.parseASSTime(parts[1]),
                endTime: this.parseASSTime(parts[2]),
                text: parts.slice(9).join(',').replace(/\\N/g, '\n')
            };
        }
        return null;
    }
    
    parseASSTime(timeStr) {
        const match = timeStr.match(/(\d{1,2}):(\d{2}):(\d{2})\.(\d{2})/);
        if (match) {
            const hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const seconds = parseInt(match[3]);
            const centiseconds = parseInt(match[4]);
            
            return hours * 3600 + minutes * 60 + seconds + centiseconds / 100;
        }
        return 0;
    }
    
    parseVTT(content) {
        const lines = content.split('\n');
        const subtitles = [];
        let currentSubtitle = null;
        let lineIndex = 0;
        
        // 跳过 WEBVTT 头
        while (lineIndex < lines.length && !lines[lineIndex].includes('-->')) {
            lineIndex++;
        }
        
        while (lineIndex < lines.length) {
            const line = lines[lineIndex].trim();
            
            if (line.includes('-->')) {
                if (currentSubtitle) {
                    subtitles.push(currentSubtitle);
                }
                
                const timeMatch = line.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
                if (timeMatch) {
                    currentSubtitle = {
                        startTime: this.parseVTTTime(timeMatch[1]),
                        endTime: this.parseVTTTime(timeMatch[2]),
                        text: ''
                    };
                }
                
                lineIndex++;
                
                // 读取字幕文本
                while (lineIndex < lines.length && lines[lineIndex].trim() !== '') {
                    currentSubtitle.text += lines[lineIndex] + '\n';
                    lineIndex++;
                }
                
                currentSubtitle.text = currentSubtitle.text.trim();
            }
            
            lineIndex++;
        }
        
        if (currentSubtitle) {
            subtitles.push(currentSubtitle);
        }
        
        return subtitles;
    }
    
    parseVTTTime(timeStr) {
        const match = timeStr.match(/(\d{2}):(\d{2}):(\d{2})\.(\d{3})/);
        if (match) {
            const hours = parseInt(match[1]);
            const minutes = parseInt(match[2]);
            const seconds = parseInt(match[3]);
            const milliseconds = parseInt(match[4]);
            
            return hours * 3600 + minutes * 60 + seconds + milliseconds / 1000;
        }
        return 0;
    }
}

// 初始化插件
let subtitlePlugin;
try {
    subtitlePlugin = new EagleSubtitlePlugin();
} catch (error) {
    console.error('❌ 插件初始化失败:', error);
}