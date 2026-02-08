using Amazon.Lambda.Core;
using System.Text.Json.Serialization;

// Assembly attribute to enable the Lambda function's JSON input to be converted into a .NET class.
[assembly: LambdaSerializer(typeof(Amazon.Lambda.Serialization.SystemTextJson.DefaultLambdaJsonSerializer))]

namespace TasclyBackend.EmailLambda;

public class Function
{
    public class EmailRequest
    {
        public string Email { get; set; } = string.Empty;
        public string Username { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// A simple function that simulates sending an email
    /// </summary>
    /// <param name="input"></param>
    /// <param name="context"></param>
    /// <returns></returns>
    public string FunctionHandler(EmailRequest input, ILambdaContext context)
    {
        context.Logger.LogInformation($"[Email Service] Processing email request for user: {input.Username} ({input.Email})");
        context.Logger.LogInformation($"[Email Service] Content: {input.Message}");
        
        // Simulate processing time
        System.Threading.Thread.Sleep(500);
        
        context.Logger.LogInformation($"[Email Service] Email successfully sent to {input.Email}");
        
        return $"Email sent to {input.Email}";
    }
}
