# Eagle 字幕插件

为 Eagle 播放器提供字幕显示功能，支持 SRT、ASS、VTT 等常见字幕格式。

## 功能特点

- 🎬 **自动字幕加载**：自动查找与视频同名的字幕文件
- 📝 **多格式支持**：支持 SRT、ASS、SSA、VTT 字幕格式
- ⏰ **精确同步**：高精度的字幕时间同步
- 🎨 **样式自定义**：可调整字幕大小、位置、透明度
- ⌨️ **快捷键支持**：H 键显示/隐藏，O 键调整偏移，S 键更改样式
- 🔄 **实时调整**：支持时间偏移调整，解决字幕不同步问题
- 📱 **响应式设计**：适配不同屏幕尺寸
- ⚡ **性能优化**：支持大量字幕的高效处理

## 安装方法

### 方法一：直接安装

1. 下载最新版本的插件文件
2. 将插件文件夹复制到 Eagle 插件目录：
   - **Windows**: `%APPDATA%\Eagle\plugins\`
   - **macOS**: `~/Library/Application Support/Eagle/plugins/`
   - **Linux**: `~/.config/Eagle/plugins/`
3. 重启 Eagle 应用
4. 在 Eagle 中启用插件

### 方法二：源码构建

```bash
# 克隆项目
git clone https://github.com/xiaolushuo/eagle-subtitle-plugin.git
cd eagle-subtitle-plugin

# 安装依赖
npm install

# 构建插件
npm run build

# 复制到 Eagle 插件目录
cp -r dist/* ~/.config/Eagle/plugins/eagle-subtitle-plugin/
```

## 使用方法

### 基本使用

1. 在 Eagle 中选择一个视频文件
2. 确保视频文件同目录下有同名字幕文件（如：`movie.mp4` + `movie.srt`）
3. 点击播放视频，字幕会自动显示在视频上

### 控制面板

- **显示/隐藏**：点击控制面板中的"显示/隐藏"按钮
- **调整偏移**：点击"调整偏移"按钮，输入时间偏移值（秒）
- **样式设置**：点击"样式设置"按钮，调整字幕大小和位置
- **重新加载**：点击"重新加载"按钮，重新加载字幕文件

### 快捷键

| 快捷键 | 功能 |
|--------|------|
| `H` | 显示/隐藏字幕 |
| `O` | 调整时间偏移 |
| `S` | 更改字幕样式 |
| `ESC` | 隐藏控制面板 |

## 支持的字幕格式

### SRT 格式
```srt
1
00:00:01,000 --> 00:00:04,000
这是第一条字幕

2
00:00:05,000 --> 00:00:08,000
这是第二条字幕
```

### ASS/SSA 格式
```ass
[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
Dialogue: 0,0:00:01.00,0:00:04.00,Default,,0,0,0,,这是第一条字幕
```

### VTT 格式
```vtt
WEBVTT

00:00:01.000 --> 00:00:04.000
这是第一条字幕

00:00:05.000 --> 00:00:08.000
这是第二条字幕
```

## 文件结构

```
eagle-subtitle-plugin/
├── manifest.json              # 插件配置文件
├── main.js                    # 主控制器
├── subtitle.html              # 字幕显示页面
├── README.md                 # 使用说明
└── icon.png                  # 插件图标（可选）
```

## 故障排除

### 字幕不显示

1. 确保字幕文件与视频文件同名
2. 检查字幕文件格式是否支持
3. 确认字幕文件编码为 UTF-8
4. 检查 Eagle 播放器是否正在播放
5. 查看控制台日志是否有错误信息

### 时间不同步

1. 使用"调整偏移"功能
2. 输入正数延迟字幕，负数提前字幕
3. 例如：字幕快 2 秒，输入 `-2`

### 插件无法加载

1. 确认插件文件放置在正确目录
2. 检查 manifest.json 格式是否正确
3. 查看 Eagle 控制台是否有错误信息
4. 确保所有依赖文件都存在

### 性能问题

1. 如果字幕文件很大（超过1000条），插件会自动启用性能模式
2. 可以通过调整更新间隔来优化性能
3. 关闭不必要的功能可以提高性能

## 开发说明

### 依赖技术

- Eagle Plugin API
- Electron
- Node.js
- HTML5/CSS3/JavaScript

### 架构设计

- **模块化设计**：每个功能都有独立的模块
- **事件驱动**：基于事件的异步处理
- **性能优化**：使用二分查找和缓存机制
- **错误处理**：完整的异常处理机制

### 扩展功能

可以添加的功能：

- 多语言字幕支持
- 字幕样式导入/导出
- 在线字幕下载
- 字幕编辑功能
- 字幕翻译功能
- 字幕搜索功能
- 字幕时间轴调整
- 批量字幕处理

### 调试方法

1. 打开开发者工具查看控制台日志
2. 检查字幕文件路径是否正确
3. 验证字幕格式是否被正确解析
4. 使用调试模式查看详细运行信息

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 联系方式

如有问题或建议，请通过以下方式联系：

- GitHub Issues: https://github.com/xiaolushuo/eagle-subtitle-plugin/issues
- Email: your-email@example.com

## 更新日志

### v1.0.0 (2024-08-21)

- 初始版本发布
- 支持 SRT、ASS、VTT 格式
- 基本字幕显示功能
- 时间偏移调整
- 样式自定义
- 快捷键支持

## 致谢

感谢所有为本项目做出贡献的开发者！

---

**注意**：本插件为第三方开发，与 Eagle 官方无关。使用前请确保符合 Eagle 的使用条款。