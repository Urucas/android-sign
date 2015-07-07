
BABEL = ./node_modules/.bin/babel


node: lib
	@mkdir -p ./node
	@for path in lib/*.js; do \
		file=`basename $$path`; \
		$(BABEL) "lib/$$file" > "node/$$file"; \
	done

clean:
	@rm -rf ./node/
