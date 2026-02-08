using Xunit;
using Amazon.Lambda.TestUtilities;
using TasclyBackend.EmailLambda;

namespace TasclyBackend.EmailLambda.Tests;

public class FunctionTests
{
    [Fact]
    public void TestEmailFunction()
    {
        // Arrange
        var function = new Function();
        var context = new TestLambdaContext();
        var request = new Function.EmailRequest
        {
            Email = "test@example.com",
            Username = "TestUser",
            Message = "This is a test message from xUnit."
        };

        // Act
        var result = function.FunctionHandler(request, context);

        // Assert
        Assert.Equal("Email sent to test@example.com", result);
        Assert.Contains("Processing email request for user: TestUser", ((TestLambdaLogger)context.Logger).Buffer.ToString());
    }
}
