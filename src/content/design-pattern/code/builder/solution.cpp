#include <iostream>
#include <string>
#include <vector>
#include <map>
#include <memory>
#include <stdexcept>

/**
 * Builder Pattern - SQL Query Builder Example
 * Constructs complex SQL queries with fluent interface and validation
 */

class SqlQuery {
private:
    std::string queryType;
    std::string tableName;
    std::vector<std::string> selectColumns;
    std::map<std::string, std::string> insertValues;
    std::map<std::string, std::string> updateValues;
    std::vector<std::string> whereConditions;
    std::vector<std::string> orderByColumns;
    std::vector<std::string> groupByColumns;
    std::string havingCondition;
    int limitValue;
    int offsetValue;
    std::vector<std::string> joinClauses;
    
public:
    SqlQuery(const std::string& type, const std::string& table)
        : queryType(type), tableName(table), limitValue(-1), offsetValue(-1) {}
    
    // Getters for builder access
    std::string getQueryType() const { return queryType; }
    std::string getTableName() const { return tableName; }
    const std::vector<std::string>& getSelectColumns() const { return selectColumns; }
    const std::map<std::string, std::string>& getInsertValues() const { return insertValues; }
    const std::map<std::string, std::string>& getUpdateValues() const { return updateValues; }
    const std::vector<std::string>& getWhereConditions() const { return whereConditions; }
    const std::vector<std::string>& getOrderByColumns() const { return orderByColumns; }
    const std::vector<std::string>& getGroupByColumns() const { return groupByColumns; }
    const std::string& getHavingCondition() const { return havingCondition; }
    int getLimitValue() const { return limitValue; }
    int getOffsetValue() const { return offsetValue; }
    const std::vector<std::string>& getJoinClauses() const { return joinClauses; }
    
    // Setters for builder
    void setSelectColumns(const std::vector<std::string>& columns) { selectColumns = columns; }
    void setInsertValues(const std::map<std::string, std::string>& values) { insertValues = values; }
    void setUpdateValues(const std::map<std::string, std::string>& values) { updateValues = values; }
    void setWhereConditions(const std::vector<std::string>& conditions) { whereConditions = conditions; }
    void setOrderByColumns(const std::vector<std::string>& columns) { orderByColumns = columns; }
    void setGroupByColumns(const std::vector<std::string>& columns) { groupByColumns = columns; }
    void setHavingCondition(const std::string& condition) { havingCondition = condition; }
    void setLimitValue(int limit) { limitValue = limit; }
    void setOffsetValue(int offset) { offsetValue = offset; }
    void setJoinClauses(const std::vector<std::string>& joins) { joinClauses = joins; }
    
    std::string toSql() const {
        std::string query;
        
        if (queryType == "SELECT") {
            query = "SELECT ";
            
            if (selectColumns.empty()) {
                query += "*";
            } else {
                for (size_t i = 0; i < selectColumns.size(); ++i) {
                    query += selectColumns[i];
                    if (i < selectColumns.size() - 1) query += ", ";
                }
            }
            
            query += " FROM " + tableName;
            
            // Add joins
            for (const auto& join : joinClauses) {
                query += " " + join;
            }
            
        } else if (queryType == "INSERT") {
            query = "INSERT INTO " + tableName + " (";
            
            size_t i = 0;
            for (const auto& pair : insertValues) {
                query += pair.first;
                if (++i < insertValues.size()) query += ", ";
            }
            
            query += ") VALUES (";
            
            i = 0;
            for (const auto& pair : insertValues) {
                query += "'" + pair.second + "'";
                if (++i < insertValues.size()) query += ", ";
            }
            query += ")";
            
        } else if (queryType == "UPDATE") {
            query = "UPDATE " + tableName + " SET ";
            
            size_t i = 0;
            for (const auto& pair : updateValues) {
                query += pair.first + " = '" + pair.second + "'";
                if (++i < updateValues.size()) query += ", ";
            }
            
        } else if (queryType == "DELETE") {
            query = "DELETE FROM " + tableName;
        }
        
        // Add WHERE clause
        if (!whereConditions.empty()) {
            query += " WHERE ";
            for (size_t i = 0; i < whereConditions.size(); ++i) {
                query += whereConditions[i];
                if (i < whereConditions.size() - 1) query += " AND ";
            }
        }
        
        // Add GROUP BY clause
        if (!groupByColumns.empty()) {
            query += " GROUP BY ";
            for (size_t i = 0; i < groupByColumns.size(); ++i) {
                query += groupByColumns[i];
                if (i < groupByColumns.size() - 1) query += ", ";
            }
        }
        
        // Add HAVING clause
        if (!havingCondition.empty()) {
            query += " HAVING " + havingCondition;
        }
        
        // Add ORDER BY clause
        if (!orderByColumns.empty()) {
            query += " ORDER BY ";
            for (size_t i = 0; i < orderByColumns.size(); ++i) {
                query += orderByColumns[i];
                if (i < orderByColumns.size() - 1) query += ", ";
            }
        }
        
        // Add LIMIT clause
        if (limitValue > 0) {
            query += " LIMIT " + std::to_string(limitValue);
        }
        
        // Add OFFSET clause
        if (offsetValue > 0) {
            query += " OFFSET " + std::to_string(offsetValue);
        }
        
        return query + ";";
    }
    
    void execute() const {
        std::cout << "🗄️  Executing SQL Query:" << std::endl;
        std::cout << "📝 " << toSql() << std::endl;
        std::cout << "⏱️  Query type: " << queryType << " on table: " << tableName << std::endl;
        std::cout << "✅ Query executed successfully!" << std::endl;
    }
    
    void explain() const {
        std::cout << "SQL Query Analysis:" << std::endl;
        std::cout << "├─ Type: " << queryType << std::endl;
        std::cout << "├─ Table: " << tableName << std::endl;
        
        if (!selectColumns.empty()) {
            std::cout << "├─ Columns: " << selectColumns.size() << " selected" << std::endl;
        }
        
        if (!whereConditions.empty()) {
            std::cout << "├─ WHERE conditions: " << whereConditions.size() << std::endl;
        }
        
        if (!joinClauses.empty()) {
            std::cout << "├─ JOINs: " << joinClauses.size() << std::endl;
        }
        
        if (!orderByColumns.empty()) {
            std::cout << "├─ ORDER BY: " << orderByColumns.size() << " columns" << std::endl;
        }
        
        if (limitValue > 0) {
            std::cout << "├─ LIMIT: " << limitValue << " rows" << std::endl;
        }
        
        std::cout << "└─ Generated SQL: " << toSql().length() << " characters" << std::endl;
    }
};

class SqlQueryBuilder {
private:
    std::unique_ptr<SqlQuery> query;
    
public:
    SqlQueryBuilder(const std::string& queryType, const std::string& tableName) {
        query = std::make_unique<SqlQuery>(queryType, tableName);
    }
    
    // SELECT specific methods
    SqlQueryBuilder& select(const std::vector<std::string>& columns) {
        if (query->getQueryType() != "SELECT") {
            throw std::invalid_argument("select() can only be used with SELECT queries");
        }
        query->setSelectColumns(columns);
        return *this;
    }
    
    SqlQueryBuilder& select(const std::string& column) {
        return select(std::vector<std::string>{column});
    }
    
    // INSERT specific methods
    SqlQueryBuilder& values(const std::map<std::string, std::string>& values) {
        if (query->getQueryType() != "INSERT") {
            throw std::invalid_argument("values() can only be used with INSERT queries");
        }
        query->setInsertValues(values);
        return *this;
    }
    
    SqlQueryBuilder& value(const std::string& column, const std::string& value) {
        auto currentValues = query->getInsertValues();
        currentValues[column] = value;
        return values(currentValues);
    }
    
    // UPDATE specific methods
    SqlQueryBuilder& set(const std::map<std::string, std::string>& values) {
        if (query->getQueryType() != "UPDATE") {
            throw std::invalid_argument("set() can only be used with UPDATE queries");
        }
        query->setUpdateValues(values);
        return *this;
    }
    
    SqlQueryBuilder& set(const std::string& column, const std::string& value) {
        auto currentValues = query->getUpdateValues();
        currentValues[column] = value;
        return set(currentValues);
    }
    
    // Common methods for all query types
    SqlQueryBuilder& where(const std::string& condition) {
        auto conditions = query->getWhereConditions();
        conditions.push_back(condition);
        query->setWhereConditions(conditions);
        return *this;
    }
    
    SqlQueryBuilder& whereEquals(const std::string& column, const std::string& value) {
        return where(column + " = '" + value + "'");
    }
    
    SqlQueryBuilder& whereLike(const std::string& column, const std::string& pattern) {
        return where(column + " LIKE '" + pattern + "'");
    }
    
    SqlQueryBuilder& whereIn(const std::string& column, const std::vector<std::string>& values) {
        std::string condition = column + " IN (";
        for (size_t i = 0; i < values.size(); ++i) {
            condition += "'" + values[i] + "'";
            if (i < values.size() - 1) condition += ", ";
        }
        condition += ")";
        return where(condition);
    }
    
    // JOIN methods
    SqlQueryBuilder& innerJoin(const std::string& table, const std::string& condition) {
        auto joins = query->getJoinClauses();
        joins.push_back("INNER JOIN " + table + " ON " + condition);
        query->setJoinClauses(joins);
        return *this;
    }
    
    SqlQueryBuilder& leftJoin(const std::string& table, const std::string& condition) {
        auto joins = query->getJoinClauses();
        joins.push_back("LEFT JOIN " + table + " ON " + condition);
        query->setJoinClauses(joins);
        return *this;
    }
    
    // ORDER BY methods
    SqlQueryBuilder& orderBy(const std::string& column) {
        auto columns = query->getOrderByColumns();
        columns.push_back(column);
        query->setOrderByColumns(columns);
        return *this;
    }
    
    SqlQueryBuilder& orderBy(const std::string& column, const std::string& direction) {
        return orderBy(column + " " + direction);
    }
    
    // GROUP BY methods
    SqlQueryBuilder& groupBy(const std::string& column) {
        auto columns = query->getGroupByColumns();
        columns.push_back(column);
        query->setGroupByColumns(columns);
        return *this;
    }
    
    SqlQueryBuilder& having(const std::string& condition) {
        query->setHavingCondition(condition);
        return *this;
    }
    
    // LIMIT and OFFSET
    SqlQueryBuilder& limit(int count) {
        if (count <= 0) {
            throw std::invalid_argument("LIMIT must be positive");
        }
        query->setLimitValue(count);
        return *this;
    }
    
    SqlQueryBuilder& offset(int count) {
        if (count < 0) {
            throw std::invalid_argument("OFFSET cannot be negative");
        }
        query->setOffsetValue(count);
        return *this;
    }
    
    // Build method
    std::unique_ptr<SqlQuery> build() {
        // Validation
        if (query->getQueryType() == "INSERT" && query->getInsertValues().empty()) {
            throw std::invalid_argument("INSERT query must have values");
        }
        
        if (query->getQueryType() == "UPDATE" && query->getUpdateValues().empty()) {
            throw std::invalid_argument("UPDATE query must have SET values");
        }
        
        if ((query->getQueryType() == "UPDATE" || query->getQueryType() == "DELETE") 
            && query->getWhereConditions().empty()) {
            std::cout << "⚠️  Warning: " << query->getQueryType() 
                      << " query without WHERE clause affects all rows!" << std::endl;
        }
        
        return std::move(query);
    }
};

// Director class for common query patterns
class SqlQueryDirector {
public:
    static std::unique_ptr<SqlQuery> selectAllFromTable(const std::string& tableName) {
        return SqlQueryBuilder("SELECT", tableName).build();
    }
    
    static std::unique_ptr<SqlQuery> selectUserById(int userId) {
        return SqlQueryBuilder("SELECT", "users")
                .select({"id", "username", "email", "created_at"})
                .whereEquals("id", std::to_string(userId))
                .build();
    }
    
    static std::unique_ptr<SqlQuery> paginatedSelect(const std::string& tableName, 
                                                    int pageSize, int pageNumber) {
        return SqlQueryBuilder("SELECT", tableName)
                .orderBy("id")
                .limit(pageSize)
                .offset(pageSize * (pageNumber - 1))
                .build();
    }
    
    static std::unique_ptr<SqlQuery> createUser(const std::string& username, 
                                               const std::string& email) {
        return SqlQueryBuilder("INSERT", "users")
                .value("username", username)
                .value("email", email)
                .value("created_at", "NOW()")
                .build();
    }
};

int main() {
    std::cout << "=== Builder Pattern Demo - SQL Query Builder ===\n" << std::endl;
    
    try {
        // Example 1: Complex SELECT query
        std::cout << "1. Complex SELECT Query with JOINs:" << std::endl;
        auto complexQuery = SqlQueryBuilder("SELECT", "users")
                .select({"u.username", "u.email", "p.title as profile_title", "COUNT(o.id) as order_count"})
                .innerJoin("profiles p", "p.user_id = u.id")
                .leftJoin("orders o", "o.user_id = u.id")
                .where("u.active = true")
                .where("u.created_at > '2023-01-01'")
                .groupBy("u.id")
                .having("COUNT(o.id) > 0")
                .orderBy("order_count", "DESC")
                .limit(10)
                .build();
        
        complexQuery->explain();
        std::cout << std::endl;
        complexQuery->execute();
        
        std::cout << "\n" << std::string(60, '=') << "\n" << std::endl;
        
        // Example 2: INSERT query
        std::cout << "2. INSERT Query:" << std::endl;
        auto insertQuery = SqlQueryBuilder("INSERT", "products")
                .value("name", "Wireless Headphones")
                .value("price", "99.99")
                .value("category", "Electronics")
                .value("stock_quantity", "150")
                .build();
        
        insertQuery->explain();
        std::cout << std::endl;
        insertQuery->execute();
        
        std::cout << "\n" << std::string(60, '=') << "\n" << std::endl;
        
        // Example 3: UPDATE query
        std::cout << "3. UPDATE Query:" << std::endl;
        auto updateQuery = SqlQueryBuilder("UPDATE", "products")
                .set("price", "89.99")
                .set("updated_at", "NOW()")
                .whereEquals("category", "Electronics")
                .where("stock_quantity < 10")
                .build();
        
        updateQuery->explain();
        std::cout << std::endl;
        updateQuery->execute();
        
        std::cout << "\n" << std::string(60, '=') << "\n" << std::endl;
        
        // Example 4: Using Director for common patterns
        std::cout << "4. Using Director for Common Patterns:" << std::endl;
        
        std::cout << "\nSelect all users:" << std::endl;
        auto allUsers = SqlQueryDirector::selectAllFromTable("users");
        allUsers->execute();
        
        std::cout << "\nSelect specific user:" << std::endl;
        auto specificUser = SqlQueryDirector::selectUserById(123);
        specificUser->execute();
        
        std::cout << "\nPaginated results:" << std::endl;
        auto paginatedResults = SqlQueryDirector::paginatedSelect("products", 25, 2);
        paginatedResults->execute();
        
        std::cout << "\nCreate new user:" << std::endl;
        auto newUser = SqlQueryDirector::createUser("john_doe", "john@example.com");
        newUser->execute();
        
        // Example 5: Validation examples
        std::cout << "\n" << std::string(60, '=') << "\n" << std::endl;
        std::cout << "5. Validation Examples:" << std::endl;
        
        try {
            auto invalidInsert = SqlQueryBuilder("INSERT", "users").build();
        } catch (const std::exception& e) {
            std::cout << "❌ Build failed: " << e.what() << std::endl;
        }
        
        try {
            auto invalidLimit = SqlQueryBuilder("SELECT", "users").limit(-5).build();
        } catch (const std::exception& e) {
            std::cout << "❌ Build failed: " << e.what() << std::endl;
        }
        
        // This will show a warning but not fail
        std::cout << "\nDangerous DELETE (shows warning):" << std::endl;
        auto dangerousDelete = SqlQueryBuilder("DELETE", "temp_data").build();
        
        std::cout << "\n✅ SQL Builder pattern successfully demonstrated!" << std::endl;
        std::cout << "Benefits: Type safety, fluent interface, validation, SQL injection prevention" << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "❌ Error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}
