// Interpreter Design Pattern - Arithmetic Expression Evaluator
import java.util.*;

// Context class to hold variable values
class Context {
    private Map<String, Integer> variables = new HashMap<>();
    
    public void setVariable(String name, int value) {
        variables.put(name, value);
    }
    
    public int getVariable(String name) {
        return variables.getOrDefault(name, 0);
    }
}

// Abstract Expression
abstract class Expression {
    public abstract int interpret(Context context);
}

// Terminal Expression for numbers
class NumberExpression extends Expression {
    private int number;
    
    public NumberExpression(int number) {
        this.number = number;
    }
    
    @Override
    public int interpret(Context context) {
        return number;
    }
}

// Terminal Expression for variables
class VariableExpression extends Expression {
    private String variableName;
    
    public VariableExpression(String variableName) {
        this.variableName = variableName;
    }
    
    @Override
    public int interpret(Context context) {
        return context.getVariable(variableName);
    }
}

// Non-terminal Expression for addition
class AddExpression extends Expression {
    private Expression leftExpression;
    private Expression rightExpression;
    
    public AddExpression(Expression left, Expression right) {
        this.leftExpression = left;
        this.rightExpression = right;
    }
    
    @Override
    public int interpret(Context context) {
        return leftExpression.interpret(context) + rightExpression.interpret(context);
    }
}

// Non-terminal Expression for subtraction
class SubtractExpression extends Expression {
    private Expression leftExpression;
    private Expression rightExpression;
    
    public SubtractExpression(Expression left, Expression right) {
        this.leftExpression = left;
        this.rightExpression = right;
    }
    
    @Override
    public int interpret(Context context) {
        return leftExpression.interpret(context) - rightExpression.interpret(context);
    }
}

// Non-terminal Expression for multiplication
class MultiplyExpression extends Expression {
    private Expression leftExpression;
    private Expression rightExpression;
    
    public MultiplyExpression(Expression left, Expression right) {
        this.leftExpression = left;
        this.rightExpression = right;
    }
    
    @Override
    public int interpret(Context context) {
        return leftExpression.interpret(context) * rightExpression.interpret(context);
    }
}

// Simple expression parser
class ExpressionParser {
    public static Expression parse(String expression, Context context) {
        // Simple parsing for demonstration: "x + y * z"
        // In real implementation, use proper parsing techniques
        String[] tokens = expression.split(" ");
        
        if (tokens.length == 3) {
            Expression left = parseOperand(tokens[0], context);
            String operator = tokens[1];
            Expression right = parseOperand(tokens[2], context);
            
            switch (operator) {
                case "+":
                    return new AddExpression(left, right);
                case "-":
                    return new SubtractExpression(left, right);
                case "*":
                    return new MultiplyExpression(left, right);
            }
        }
        
        return parseOperand(expression.trim(), context);
    }
    
    private static Expression parseOperand(String operand, Context context) {
        try {
            int number = Integer.parseInt(operand);
            return new NumberExpression(number);
        } catch (NumberFormatException e) {
            return new VariableExpression(operand);
        }
    }
}

// Client code
public class Main {
    public static void main(String[] args) {
        Context context = new Context();
        context.setVariable("x", 10);
        context.setVariable("y", 5);
        context.setVariable("z", 2);
        
        System.out.println("=== Interpreter Pattern Demo ===");
        
        // Direct expression building
        Expression expression1 = new AddExpression(
            new NumberExpression(10), 
            new NumberExpression(5)
        );
        System.out.println("10 + 5 = " + expression1.interpret(context));
        
        // Using variables
        Expression expression2 = new MultiplyExpression(
            new VariableExpression("x"),
            new VariableExpression("y")
        );
        System.out.println("x * y = " + expression2.interpret(context));
        
        // Complex expression
        Expression expression3 = new AddExpression(
            new VariableExpression("x"),
            new MultiplyExpression(
                new VariableExpression("y"),
                new VariableExpression("z")
            )
        );
        System.out.println("x + (y * z) = " + expression3.interpret(context));
        
        // Using simple parser
        System.out.println("\n=== Using Parser ===");
        Expression parsed1 = ExpressionParser.parse("x + y", context);
        System.out.println("x + y = " + parsed1.interpret(context));
        
        Expression parsed2 = ExpressionParser.parse("10 * 3", context);
        System.out.println("10 * 3 = " + parsed2.interpret(context));
    }
}
