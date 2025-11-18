#include <iostream>
#include <string>
#include <unordered_map>
#include <memory>
#include <sstream>
#include <vector>

// Context class to hold variable values
class Context {
private:
    std::unordered_map<std::string, int> variables;

public:
    void setVariable(const std::string& name, int value) {
        variables[name] = value;
    }
    
    int getVariable(const std::string& name) const {
        auto it = variables.find(name);
        return (it != variables.end()) ? it->second : 0;
    }
};

// Abstract Expression
class Expression {
public:
    virtual ~Expression() = default;
    virtual int interpret(const Context& context) = 0;
};

// Terminal Expression for numbers
class NumberExpression : public Expression {
private:
    int number;

public:
    explicit NumberExpression(int num) : number(num) {}
    
    int interpret(const Context& context) override {
        return number;
    }
};

// Terminal Expression for variables
class VariableExpression : public Expression {
private:
    std::string variableName;

public:
    explicit VariableExpression(const std::string& name) : variableName(name) {}
    
    int interpret(const Context& context) override {
        return context.getVariable(variableName);
    }
};

// Non-terminal Expression for addition
class AddExpression : public Expression {
private:
    std::unique_ptr<Expression> leftExpression;
    std::unique_ptr<Expression> rightExpression;

public:
    AddExpression(std::unique_ptr<Expression> left, std::unique_ptr<Expression> right)
        : leftExpression(std::move(left)), rightExpression(std::move(right)) {}
    
    int interpret(const Context& context) override {
        return leftExpression->interpret(context) + rightExpression->interpret(context);
    }
};

// Non-terminal Expression for subtraction
class SubtractExpression : public Expression {
private:
    std::unique_ptr<Expression> leftExpression;
    std::unique_ptr<Expression> rightExpression;

public:
    SubtractExpression(std::unique_ptr<Expression> left, std::unique_ptr<Expression> right)
        : leftExpression(std::move(left)), rightExpression(std::move(right)) {}
    
    int interpret(const Context& context) override {
        return leftExpression->interpret(context) - rightExpression->interpret(context);
    }
};

// Non-terminal Expression for multiplication
class MultiplyExpression : public Expression {
private:
    std::unique_ptr<Expression> leftExpression;
    std::unique_ptr<Expression> rightExpression;

public:
    MultiplyExpression(std::unique_ptr<Expression> left, std::unique_ptr<Expression> right)
        : leftExpression(std::move(left)), rightExpression(std::move(right)) {}
    
    int interpret(const Context& context) override {
        return leftExpression->interpret(context) * rightExpression->interpret(context);
    }
};

// Simple expression parser
class ExpressionParser {
public:
    static std::unique_ptr<Expression> parse(const std::string& expression) {
        std::istringstream iss(expression);
        std::vector<std::string> tokens;
        std::string token;
        
        while (iss >> token) {
            tokens.push_back(token);
        }
        
        if (tokens.size() == 3) {
            auto left = parseOperand(tokens[0]);
            const std::string& op = tokens[1];
            auto right = parseOperand(tokens[2]);
            
            if (op == "+") {
                return std::make_unique<AddExpression>(std::move(left), std::move(right));
            } else if (op == "-") {
                return std::make_unique<SubtractExpression>(std::move(left), std::move(right));
            } else if (op == "*") {
                return std::make_unique<MultiplyExpression>(std::move(left), std::move(right));
            }
        }
        
        return parseOperand(expression);
    }

private:
    static std::unique_ptr<Expression> parseOperand(const std::string& operand) {
        try {
            int number = std::stoi(operand);
            return std::make_unique<NumberExpression>(number);
        } catch (const std::invalid_argument&) {
            return std::make_unique<VariableExpression>(operand);
        }
    }
};

// Client code
int main() {
    Context context;
    context.setVariable("x", 10);
    context.setVariable("y", 5);
    context.setVariable("z", 2);
    
    std::cout << "=== Interpreter Pattern Demo ===" << std::endl;
    
    // Direct expression building
    auto expression1 = std::make_unique<AddExpression>(
        std::make_unique<NumberExpression>(10),
        std::make_unique<NumberExpression>(5)
    );
    std::cout << "10 + 5 = " << expression1->interpret(context) << std::endl;
    
    // Using variables
    auto expression2 = std::make_unique<MultiplyExpression>(
        std::make_unique<VariableExpression>("x"),
        std::make_unique<VariableExpression>("y")
    );
    std::cout << "x * y = " << expression2->interpret(context) << std::endl;
    
    // Complex expression
    auto expression3 = std::make_unique<AddExpression>(
        std::make_unique<VariableExpression>("x"),
        std::make_unique<MultiplyExpression>(
            std::make_unique<VariableExpression>("y"),
            std::make_unique<VariableExpression>("z")
        )
    );
    std::cout << "x + (y * z) = " << expression3->interpret(context) << std::endl;
    
    // Using simple parser
    std::cout << "\n=== Using Parser ===" << std::endl;
    auto parsed1 = ExpressionParser::parse("x + y");
    std::cout << "x + y = " << parsed1->interpret(context) << std::endl;
    
    auto parsed2 = ExpressionParser::parse("10 * 3");
    std::cout << "10 * 3 = " << parsed2->interpret(context) << std::endl;
    
    return 0;
}
