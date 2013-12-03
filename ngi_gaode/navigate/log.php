<?php
/**
 * Created by JetBrains PhpStorm.
 * User: rax
 * Date: 12-9-7
 * Time: 上午11:21
 * Description:  记录客户端发送的错误信息，写入到log.txt文件中
 */
function displayError()
{
//    不显示 playTTS或updateCoord未定义的异常
    if (preg_match('/playTTS/', $_GET['msg']) ||
        preg_match('/updateCoord/', $_GET['msg'])
    ) {
        return;
    }
//设置PHP的时间函数所使用的时区
    date_default_timezone_set("PRC");
    $logMsg = 'Error Message: ' . $_GET["msg"];
    $time = date("D M j G:i:s T Y");
    $level = 'Error Level: ' . $_GET["sev"];
    $arr = explode("at ", $_GET['stack']);
    $stack = 'Error Stack: ';
    foreach ($arr as $key => $value) {
        $stack .= $value . "\r\n";
    }

    error_log("\r\n" . $time . "\r\n" . $level . "\r\n" . $logMsg . "\r\n" . $stack . "\r\n", 3, "log.txt");
}

displayError();
?>