<?php
/**
 * Script Backend PHP - Envio de Comprovantes para o Microsoft Power Automate
 * UNIMAR EAD - Portal de Envio de Comprovantes
 * 
 * Salve este arquivo na RAIZ do seu servidor web (ex: public_html/upload.php ou www/upload.php)
 */

// Configurações de Cabeçalho e CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Tratar requisição Preflight CORS (OPTIONS)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Aceitar apenas método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Método não permitido. Utilize POST.']);
    exit;
}

// Obter corpo da requisição JSON enviado pelo formulário
$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

// Caso tenha sido enviado via multipart/form-data
if (!$data) {
    $data = $_POST;
}

$modulo        = isset($data['modulo']) ? trim($data['modulo']) : '';
$nomePolo      = isset($data['nomePolo']) ? trim($data['nomePolo']) : '';
$nomeArquivo   = isset($data['nomeArquivo']) ? trim($data['nomeArquivo']) : '';
$arquivoBase64 = isset($data['arquivoBase64']) ? trim($data['arquivoBase64']) : '';
$observacao    = isset($data['observacao']) ? trim($data['observacao']) : '';

// Validar campos obrigatórios
if (empty($modulo) || empty($nomePolo) || empty($nomeArquivo) || empty($arquivoBase64)) {
    http_response_code(400);
    echo json_encode([
        'error' => 'Dados incompletos no envio.',
        'details' => 'Os campos modulo, nomePolo, nomeArquivo e arquivoBase64 são obrigatórios.'
    ]);
    exit;
}

// Remover prefixo data:image/...;base64, se ainda estiver presente
if (strpos($arquivoBase64, ',') !== false) {
    $parts = explode(',', $arquivoBase64);
    $arquivoBase64 = end($parts);
}

// URL do Webhook do Microsoft Power Automate
$envUrl = getenv('POWER_AUTOMATE_WEBHOOK_URL');
$defaultUrl = 'https://defaulta835aabfa16a4ba683e70ddfc5fd32.5e.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/10/workflows/1038c8abad77468ca161d82cf9ec8571/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=fVIQDvzKBVTe1yvrxVTg_Utg9BkzPxldeWcf_5RwZ_Q';

if ($envUrl && strpos($envUrl, 'sig=') !== false) {
    $rawWebhookUrl = $envUrl;
} else if (strpos($defaultUrl, 'sig=') !== false) {
    $rawWebhookUrl = $defaultUrl;
} else {
    $rawWebhookUrl = $envUrl ?: $defaultUrl;
}

if (preg_match('/https?:\/\/[^\s\)\]"]+/', $rawWebhookUrl, $matches)) {
    $webhookUrl = $matches[0];
} else {
    $webhookUrl = trim($rawWebhookUrl);
}

// Montar o JSON no formato exato solicitado
$payload = [
    'modulo'        => strtoupper($modulo),
    'nomePolo'      => strtoupper($nomePolo),
    'nomeArquivo'   => $nomeArquivo,
    'arquivoBase64' => $arquivoBase64,
    'observacao'    => $observacao
];

$jsonPayload = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

// Inicializar requisição cURL
$ch = curl_init($webhookUrl);
curl_setopt_array($ch, [
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $jsonPayload,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        'Content-Length: ' . strlen($jsonPayload)
    ],
    CURLOPT_TIMEOUT        => 60,
    CURLOPT_SSL_VERIFYPEER => true
]);

$response  = curl_exec($ch);
$httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

// Tratar erro de execução cURL
if ($curlError) {
    http_response_code(500);
    echo json_encode([
        'error'   => 'Erro de conexão cURL no servidor PHP.',
        'details' => $curlError
    ]);
    exit;
}

// Retornar resposta do Power Automate ao frontend
if ($httpCode >= 200 && $httpCode < 300) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'status'  => $httpCode,
        'message' => 'Comprovante enviado com sucesso para o Power Automate!'
    ]);
} else {
    http_response_code($httpCode);
    $responseData = json_decode($response, true);
    $errorCode = $responseData['error']['code'] ?? '';

    if ($errorCode === 'WorkflowTriggerIsNotEnabled') {
        echo json_encode([
            'error'       => 'Fluxo Desativado no Power Automate (HTTP 400: WorkflowTriggerIsNotEnabled)',
            'details'     => $responseData['error']['message'] ?? 'Workflow trigger is not enabled.',
            'instruction' => 'O fluxo no Microsoft Power Automate está desligado/desativado. Acesse o portal do Power Automate (make.powerautomate.com), abra seu fluxo e clique no botão "Ligar" (Turn On) no menu superior.'
        ]);
    } else {
        echo json_encode([
            'error'   => "Erro na resposta do Power Automate (HTTP {$httpCode}).",
            'details' => $responseData ?: $response
        ]);
    }
}
